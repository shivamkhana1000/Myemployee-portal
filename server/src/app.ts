import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import ticketRouter from './routes/ticket.routes';
import dashboardRouter from './routes/dashboard.routes';
import gambaRouter from './routes/gamba.routes';
import solutionRouter from './routes/solution.routes';
import { globalErrorHandler } from './middleware/error.middleware';

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

app.use('/api/health',    healthRouter);
app.use('/api/auth',      authRouter);
app.use('/api/tickets',   ticketRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/gamba',     gambaRouter);
app.use('/api/solutions', solutionRouter);

// 404 catch-all — keeps future route additions from silently returning HTML
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — MUST be last (4-arg signature tells Express it is an error handler)
app.use(globalErrorHandler);

export default app;
