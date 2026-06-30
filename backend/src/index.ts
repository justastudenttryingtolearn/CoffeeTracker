import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import membersRouter from './routes/members';
import purchasesRouter from './routes/purchases';
import statusRouter from './routes/status';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Coffee Tracker API running on http://localhost:${PORT}`);
});

export default app;
