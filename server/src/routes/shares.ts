import { Router } from 'express';

const router = Router();

router.post('/:id/share', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(400).json({ error: 'X-User-Id header required' });
    }

    const { id } = req.params;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (targetUserId === userId) {
      return res.status(400).json({ error: 'Cannot share with yourself' });
    }

    const document = await req.context.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the owner can share' });
    }

    const targetUser = await req.context.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const share = await req.context.prisma.documentShare.upsert({
      where: {
        documentId_userId: { documentId: id, userId: targetUserId },
      },
      update: {},
      create: { documentId: id, userId: targetUserId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(share);
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

router.get('/:id/shares', async (req, res) => {
  try {
    const { id } = req.params;

    const shares = await req.context.prisma.documentShare.findMany({
      where: { documentId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(shares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
});

export default router;
