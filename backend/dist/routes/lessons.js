"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Specific word mappings for video lookup
const WORD_MAPPINGS = {
    teacher: 'teach',
};
// Words to exclude from video display
const EXCLUDED_WORDS = new Set(['eat', 'ready']);
const buildCandidateWordList = (words) => {
    const seen = new Set();
    const candidates = [];
    words.forEach((word) => {
        const normalized = word.trim().toLowerCase();
        if (normalized.length < 2)
            return;
        // Skip excluded words
        if (EXCLUDED_WORDS.has(normalized))
            return;
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
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Attempting to fetch lessons with topics and sentences...');
        const result = await database_1.default.query(`
      SELECT 
        ln.id,
        ln.lesson_name as title,
        CASE WHEN ln.photo IS NOT NULL THEN true ELSE false END as has_photo,
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const lessons = result.rows.map((row) => ({
            id: row.id,
            title: row.title,
            topics: row.topics,
            photo_url: row.has_photo ? `${baseUrl}/api/lessons/${row.id}/photo` : null,
        }));
        console.log(`✅ Fetched ${lessons.length} lessons with topics and sentences from database.`);
        res.json({
            success: true,
            data: lessons,
        });
    }
    catch (error) {
        console.error('❌ Error fetching lessons:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lessons',
            details: errorMessage,
        });
    }
});
// Fetch lesson photo as binary
router.get('/:id/photo', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`SELECT photo FROM lesson_names WHERE id = $1`, [id]);
        if (result.rows.length === 0 || !result.rows[0].photo) {
            return res.status(404).json({
                success: false,
                error: 'Photo not found',
            });
        }
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(result.rows[0].photo);
    }
    catch (error) {
        console.error('❌ Error fetching lesson photo:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch lesson photo',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Fetch sentences for a lesson from isl_sentences table
router.get('/:id/sentences', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching sentences for lesson ${id} from isl_sentences`);
        const result = await database_1.default.query(`SELECT id, lesson_id, sentence
       FROM isl_sentences
       WHERE lesson_id = $1
       ORDER BY id ASC`, [id]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error('❌ Error fetching lesson sentences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lesson sentences',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Fetch a single lesson by ID with its topics and sentences
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`
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
    }
    catch (error) {
        console.error('❌ Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lesson',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Fetch videos for extracted words
router.post('/words/videos', async (req, res) => {
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
        const result = await database_1.default.query(`
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
    }
    catch (error) {
        console.error('❌ Error fetching word videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch word videos',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
