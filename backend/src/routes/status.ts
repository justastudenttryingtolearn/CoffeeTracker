import { Router, Request, Response } from 'express';
import { getAllMembers } from '../services/memberService';
import { getAllPurchasesUnpaginated } from '../services/purchaseService';
import { computeStatus } from '../services/statusService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const members = getAllMembers();
  const purchases = getAllPurchasesUnpaginated();
  const status = computeStatus(members, purchases);
  res.json(status);
});

export default router;
