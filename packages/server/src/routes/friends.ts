import { Router, Request, Response } from 'express';
import { dataStore } from '../store/DataStore.js';

const router = Router();

router.post('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId, friendUsername } = req.body;

    let targetId = friendId as string | undefined;

    if (!targetId && typeof friendUsername === 'string') {
      const friend = dataStore.findUserByUsername(friendUsername);
      if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
      }
      targetId = friend.id;
    }

    if (!targetId) {
      res.status(400).json({ error: 'Friend identifier is required' });
      return;
    }

    if (targetId === id) {
      res.status(400).json({ error: 'Cannot add yourself as a friend' });
      return;
    }

    const friend = dataStore.getUser(targetId);
    if (!friend) {
      res.status(404).json({ error: 'Friend not found' });
      return;
    }

    dataStore.addFriend(id, targetId);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const friends = dataStore.getFriends(id);

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

export default router;
