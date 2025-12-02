import { Router, Request, Response } from 'express';
import { dataStore } from '../store/DataStore.js';
import { randomUUID } from 'node:crypto';

const router = Router();

router.post('/game-result', (req: Request, res: Response) => {
  try {
    const { players, winnerId, durationMinutes, boardSize, earnings } = req.body;

    if (!players || !winnerId || !boardSize || !earnings) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = {
      id: randomUUID(),
      players,
      winnerId,
      durationMinutes: durationMinutes ?? 0,
      boardSize,
      earnings,
      finishedAt: new Date()
    };

    dataStore.saveGameResult(result);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game result' });
  }
});

router.get('/game-history/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const games = dataStore.getGameHistory(userId);

    res.json({
      games: games.map((game) => ({
        ...game,
        isWinner: game.winnerId === userId
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

export default router;
