import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// List all unique words from isl_words2 (dedup by lowercase word)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
         MIN(id) AS id,
         MIN(word) AS word,
         MIN(video_name) AS video_name,
         'https://pub-2d19b53b556b4755a69be5d1e59da23a.r2.dev/' || MIN(video_name) AS video_url
       FROM isl_words2
       GROUP BY LOWER(word)
       ORDER BY MIN(id) ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error fetching dictionary words:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch words',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get random distractor words from isl_words2, excluding the target word (case-insensitive)
router.post('/options', async (req: Request, res: Response) => {
  try {
    const { word, count } = req.body as { word?: string; count?: number };
    if (!word) {
      return res.status(400).json({ success: false, error: 'word is required' });
    }

    const limit = typeof count === 'number' && count > 0 ? count : 3;

    const result = await pool.query(
      `SELECT word
       FROM isl_words2
       WHERE LOWER(word) <> LOWER($1)
       ORDER BY RANDOM()
       LIMIT $2`,
      [word, limit]
    );

    res.json({
      success: true,
      data: {
        word,
        distractors: result.rows.map((r) => r.word as string),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching word options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch word options',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
