import { Router, Request, Response } from 'express';
import { dataStore } from '../store/DataStore.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { sort = 'wins', page = '1', limit = '25' } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10), 1), 100);

    const leaderboard = dataStore.getLeaderboard((sort as 'wins' | 'winRate' | 'level') ?? 'wins');
    const start = (pageNumber - 1) * limitNumber;
    const items = leaderboard.slice(start, start + limitNumber);

    res.json({
      total: leaderboard.length,
      page: pageNumber,
      limit: limitNumber,
      results: items.map((user, index) => ({
        rank: start + index + 1,
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        wins: user.wins,
        losses: user.losses,
        winRate: user.totalGames === 0 ? 0 : Number(((user.wins / user.totalGames) * 100).toFixed(2))
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
