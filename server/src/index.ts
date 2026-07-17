import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import documentsRouter from './routes/documents';
import sharesRouter from './routes/shares';
import usersRouter from './routes/users';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-User-Id'],
}));

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  req.context = { prisma };
  next();
});

app.use('/api/documents', documentsRouter);
app.use('/api/documents', sharesRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, prisma };
