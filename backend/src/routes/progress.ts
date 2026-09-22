import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Mark a topic as completed for a user and return aggregated progress stats
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { userId, topicId, quizScore = 0, quizPassed = false } = req.body;
    if (!userId || !topicId) {
      return res.status(400).json({ success: false, error: 'userId and topicId required' });
    }

    // Upsert progress
    const upsert = `
      INSERT INTO user_topic_progress (user_id, topic_id, completed, completed_at, quiz_score, quiz_completed, quiz_passed, quiz_attempts)
      VALUES ($1, $2, true, NOW(), $3, true, $4, 1)
      ON CONFLICT (user_id, topic_id) DO UPDATE
      SET completed = true,
          completed_at = NOW(),
          quiz_score = GREATEST(COALESCE(user_topic_progress.quiz_score, 0), $3),
          quiz_completed = true,
          quiz_passed = $4,
          quiz_attempts = COALESCE(user_topic_progress.quiz_attempts, 0) + 1
      RETURNING *;
    `;

    await pool.query(upsert, [userId, topicId, quizScore, quizPassed]);

    // Aggregate stats
    const completedRes = await pool.query(
      'SELECT COUNT(*)::int as completed_count FROM user_topic_progress WHERE user_id = $1 AND completed = true',
      [userId]
    );

    const totalRes = await pool.query('SELECT COUNT(*)::int as total_topics FROM topics');

    const daysRes = await pool.query(
      `SELECT COUNT(DISTINCT (DATE(completed_at)))::int as active_days
       FROM user_topic_progress
       WHERE user_id = $1 AND completed = true`,
      [userId]
    );

    const masteryRes = await pool.query(
      `SELECT COALESCE(SUM(quiz_score),0)::int as mastery_points FROM user_topic_progress WHERE user_id = $1`,
      [userId]
    );

    const completed_count = completedRes.rows[0].completed_count || 0;
    const total_topics = totalRes.rows[0].total_topics || 0;
    const active_days = daysRes.rows[0].active_days || 0;
    const mastery_points = masteryRes.rows[0].mastery_points || 0;

    res.json({
      success: true,
      data: {
        completedTopics: completed_count,
        totalTopics: total_topics,
        activeDays: active_days,
        masteryPoints: mastery_points,
      }
    });
  } catch (error) {
    console.error('Error persisting progress:', error);
    res.status(500).json({ success: false, error: 'Failed to persist progress', details: error instanceof Error ? error.message : String(error) });
  }
});

// Get aggregated progress for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ success: false, error: 'invalid user id' });

    const completedRes = await pool.query(
      'SELECT COUNT(*)::int as completed_count FROM user_topic_progress WHERE user_id = $1 AND completed = true',
      [userId]
    );
    const totalRes = await pool.query('SELECT COUNT(*)::int as total_topics FROM topics');
    const daysRes = await pool.query(
      `SELECT COUNT(DISTINCT (DATE(completed_at)))::int as active_days
       FROM user_topic_progress
       WHERE user_id = $1 AND completed = true`,
      [userId]
    );
    const masteryRes = await pool.query(
      `SELECT COALESCE(SUM(quiz_score),0)::int as mastery_points FROM user_topic_progress WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        completedTopics: completedRes.rows[0].completed_count || 0,
        totalTopics: totalRes.rows[0].total_topics || 0,
        activeDays: daysRes.rows[0].active_days || 0,
        masteryPoints: masteryRes.rows[0].mastery_points || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
