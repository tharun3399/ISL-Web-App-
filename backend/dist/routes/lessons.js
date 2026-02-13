"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
const IRREGULAR_MAP = {
    took: 'take',
    taken: 'take',
    fed: 'feed',
    felt: 'feel',
    kept: 'keep',
    bought: 'buy',
    brought: 'bring',
    built: 'build',
    woke: 'wake',
    worn: 'wear',
    wore: 'wear',
    sung: 'sing',
    sang: 'sing',
    gone: 'go',
    did: 'do',
    done: 'do',
    saw: 'see',
    seen: 'see',
    was: 'be',
    were: 'be',
    ate: 'eat',
    eaten: 'eat',
    drank: 'drink',
    drunk: 'drink',
    spoke: 'speak',
    spoken: 'speak',
    wrote: 'write',
    written: 'write',
    drove: 'drive',
    driven: 'drive',
    rode: 'ride',
    ridden: 'ride',
    read: 'read',
    stood: 'stand',
    understood: 'understand',
    made: 'make',
    said: 'say',
    paid: 'pay'
};
const normalizeWordForms = (rawWord) => {
    const word = rawWord.toLowerCase();
    const forms = new Set();
    const addForm = (val) => {
        if (val && val.length >= 2)
            forms.add(val);
    };
    addForm(word);
    if (IRREGULAR_MAP[word]) {
        addForm(IRREGULAR_MAP[word]);
    }
    if (word.endsWith('ies') && word.length > 4) {
        addForm(word.slice(0, -3) + 'y');
    }
    if (word.endsWith('es') && word.length > 3) {
        addForm(word.slice(0, -2));
    }
    if (word.endsWith('s') && word.length > 3) {
        addForm(word.slice(0, -1));
    }
    if (word.endsWith('ing') && word.length > 5) {
        addForm(word.slice(0, -3));
        if (word[word.length - 4] === word[word.length - 5]) {
            addForm(word.slice(0, -4));
        }
    }
    if (word.endsWith('ed') && word.length > 4) {
        addForm(word.slice(0, -2));
        if (word.endsWith('ied')) {
            addForm(word.slice(0, -3) + 'y');
        }
        if (word[word.length - 3] === word[word.length - 4]) {
            addForm(word.slice(0, -3));
        }
    }
    return Array.from(forms);
};
const buildCandidateWordList = (words) => {
    const seen = new Set();
    const candidates = [];
    words.forEach((word) => {
        const forms = normalizeWordForms(word);
        forms.forEach((form) => {
            if (!seen.has(form)) {
                seen.add(form);
                candidates.push(form);
            }
        });
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
      GROUP BY ln.id, ln.lesson_name
      ORDER BY ln.id ASC
    `);
        console.log(`✅ Fetched ${result.rows.length} lessons with topics and sentences from database:`, result.rows);
        res.json({
            success: true,
            data: result.rows,
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
//# sourceMappingURL=lessons.js.map