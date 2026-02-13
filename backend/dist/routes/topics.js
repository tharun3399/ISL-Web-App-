"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get unique topics directly from topics table (dedup by lowercase text)
router.get('/', async (req, res) => {
    try {
        const result = await database_1.default.query(`
      SELECT MIN(t.id) AS id, MIN(t.topic) AS topic
      FROM topics t
      GROUP BY LOWER(t.topic)
      ORDER BY MIN(t.id) ASC
    `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('❌ Error fetching topics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topics',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get sentences for a specific topic
router.get('/:id/sentences', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('SELECT id, sentence FROM sentences WHERE topic_id = $1 ORDER BY id ASC', [id]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('❌ Error fetching topic sentences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topic sentences',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
