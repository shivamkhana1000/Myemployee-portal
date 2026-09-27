import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// 404 catch-all — keeps future route additions from silently returning HTML
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
