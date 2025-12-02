import { Router, Request, Response } from 'express';
import { dataStore } from '../store/DataStore.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const rooms = dataStore.getRooms().filter((room) => room.status === 'WAITING' || room.status === 'READY');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = dataStore.getRoom(id);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

export default router;
