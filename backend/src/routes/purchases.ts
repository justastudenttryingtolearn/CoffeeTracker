import { Router, Request, Response } from 'express';
import { getAllPurchases, createPurchase, deletePurchase } from '../services/purchaseService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const purchases = getAllPurchases();
  res.json(purchases);
});

router.post('/', (req: Request, res: Response) => {
  const { memberId, note } = req.body;
  if (typeof memberId !== 'number' || !Number.isInteger(memberId)) {
    res.status(400).json({ error: 'memberId must be an integer.' });
    return;
  }

  try {
    const purchase = createPurchase(memberId, note ?? null);
    res.status(201).json(purchase);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create purchase.';
    res.status(404).json({ error: message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid purchase id.' });
    return;
  }

  const deleted = deletePurchase(id);
  if (!deleted) {
    res.status(404).json({ error: 'Purchase not found.' });
    return;
  }
  res.status(204).send();
});

export default router;
