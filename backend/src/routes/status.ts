import { Router, Request, Response } from 'express';
import { getAllMembers } from '../services/memberService';
import { getAllPurchases } from '../services/purchaseService';
import { computeStatus } from '../services/statusService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const members = getAllMembers();
  const purchases = getAllPurchases();
  const status = computeStatus(members, purchases);
  res.json(status);
});

export default router;
