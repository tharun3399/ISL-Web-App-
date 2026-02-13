import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Specific word mappings for video lookup
const WORD_MAPPINGS: Record<string, string> = {
  teacher: 'teach',
};

// Words to exclude from video display
const EXCLUDED_WORDS = new Set(['eat', 'ready']);

const buildCandidateWordList = (words: string[]): string[] => {
  const seen = new Set<string>();
  const candidates: string[] = [];

  words.forEach((word) => {
    const normalized = word.trim().toLowerCase();
    if (normalized.length < 2) return;
    
    // Skip excluded words
    if (EXCLUDED_WORDS.has(normalized)) return;
    
    // Check if there's a specific mapping for this word
    const targetWord = WORD_MAPPINGS[normalized] || normalized;
    
    if (!seen.has(targetWord)) {
      seen.add(targetWord);
      candidates.push(targetWord);
    }
  });

  return candidates;
};

// Fetch all lessons with their topics and sentences
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Attempting to fetch lessons with topics and sentences...');
    const result = await pool.query(`
      SELECT 
        ln.id,
        ln.lesson_name as title,
        ln.photo,
        COALESCE(json_agg(
          json_build_object(
            'id', t.id,
            'topic', t.topic,
            'sentences', t.sentences
          ) ORDER BY t.id
        ) FILTER (WHERE t.id IS NOT NULL), '[]'::json) as topics
      FROM lesson_names ln
      LEFT JOIN (
        SELECT 
          t.id,
          t.lesson_id,
          t.topic,
          COALESCE(json_agg(json_build_object('sentence', s.sentence) ORDER BY s.id), '[]'::json) as sentences
        FROM topics t
        LEFT JOIN sentences s ON t.id = s.topic_id
        GROUP BY t.id, t.lesson_id, t.topic
      ) t ON ln.id = t.lesson_id
      GROUP BY ln.id, ln.lesson_name, ln.photo
      ORDER BY ln.id ASC
    `);
    console.log(`✅ Fetched ${result.rows.length} lessons with topics and sentences from database:`, result.rows);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching lessons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons',
      details: errorMessage,
    });
  }
});

// Fetch sentences for a lesson from isl_sentences table
router.get('/:id/sentences', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching sentences for lesson ${id} from isl_sentences`);
    const result = await pool.query(
      `SELECT id, lesson_id, sentence
       FROM isl_sentences
       WHERE lesson_id = $1
       ORDER BY id ASC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching lesson sentences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson sentences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Fetch a single lesson by ID with its topics and sentences
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        ln.id,
        ln.lesson_name as title,
        COALESCE(json_agg(
          json_build_object(
            'id', t.id,
            'topic', t.topic,
            'sentences', t.sentences
          ) ORDER BY t.id
        ) FILTER (WHERE t.id IS NOT NULL), '[]'::json) as topics
      FROM lesson_names ln
      LEFT JOIN (
        SELECT 
          t.id,
          t.lesson_id,
          t.topic,
          COALESCE(json_agg(json_build_object('sentence', s.sentence) ORDER BY s.id), '[]'::json) as sentences
        FROM topics t
        LEFT JOIN sentences s ON t.id = s.topic_id
        GROUP BY t.id, t.lesson_id, t.topic
      ) t ON ln.id = t.lesson_id
      WHERE ln.id = $1
      GROUP BY ln.id, ln.lesson_name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    console.log(`✅ Fetched lesson ${id} with topics:`, result.rows[0]);
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Fetch videos for extracted words
router.post('/words/videos', async (req: Request, res: Response) => {
  try {
    const { words } = req.body;
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid words array provided',
      });
    }

    console.log('🔍 Fetching videos for words:', words);

    const candidateWords = buildCandidateWordList(words);

    if (candidateWords.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const result = await pool.query(`
      SELECT 
        id,
        word,
        video_name,
        'https://pub-2d19b53b556b4755a69be5d1e59da23a.r2.dev/' || video_name as video_url
      FROM isl_words
      WHERE LOWER(word) = ANY($1::text[])
      ORDER BY ARRAY_POSITION($1::text[], LOWER(word))
    `, [candidateWords]);

    console.log(`✅ Fetched ${result.rows.length} word videos:`, result.rows);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching word videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch word videos',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
