import dotenv from 'dotenv';
dotenv.config(); // Must be called before any other imports that read process.env

import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`[server] MyEmployee Portal API running on http://localhost:${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
