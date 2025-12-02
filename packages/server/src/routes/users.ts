import { Router, Request, Response } from 'express';
import { dataStore } from '../store/DataStore.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const { username, avatar } = req.body;
    
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const user = dataStore.createUser({ username, avatar });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = dataStore.getUser(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, avatar } = req.body;

    const user = dataStore.updateUser(id, { username, avatar });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
