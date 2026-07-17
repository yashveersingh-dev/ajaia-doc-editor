import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

export interface RequestContext {
  prisma: PrismaClient;
}

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}
