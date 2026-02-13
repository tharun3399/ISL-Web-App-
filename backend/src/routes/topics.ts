import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get unique topics directly from topics table (dedup by lowercase text)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT MIN(t.id) AS id, MIN(t.topic) AS topic
      FROM topics t
      GROUP BY LOWER(t.topic)
      ORDER BY MIN(t.id) ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error fetching topics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get sentences for a specific topic
router.get('/:id/sentences', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, sentence FROM sentences WHERE topic_id = $1 ORDER BY id ASC',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error fetching topic sentences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topic sentences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
