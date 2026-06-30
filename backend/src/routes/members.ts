import { Router, Request, Response } from 'express';
import { getAllMembers, createMember } from '../services/memberService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const members = getAllMembers();
  res.json(members);
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Member name is required.' });
    return;
  }

  try {
    const member = createMember(name);
    res.status(201).json(member);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create member.';
    res.status(409).json({ error: message });
  }
});

export default router;
