import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import membersRouter from './routes/members';
import purchasesRouter from './routes/purchases';
import statusRouter from './routes/status';

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging (concise in production, verbose in dev)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting – 200 requests per minute per IP
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
  max: Number.parseInt(process.env.RATE_LIMIT_MAX ?? '200', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/members', membersRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/status', statusRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Global error handler – catches any unhandled errors thrown in route handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled error]', err);
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
    res.status(500).json({ error: message });
  }
);

app.listen(PORT, () => {
  console.log(`Coffee Tracker API running on http://localhost:${PORT}`);
});

export default app;
