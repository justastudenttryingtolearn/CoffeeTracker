import { Router, Request, Response } from 'express';
import { getAllMembers, createMember, deleteMember } from '../services/memberService';

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

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid member id.' });
    return;
  }

  const deleted = deleteMember(id);
  if (!deleted) {
    res.status(404).json({ error: 'Member not found.' });
    return;
  }
  res.status(204).send();
});

export default router;
