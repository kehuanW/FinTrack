import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const investmentSchema = z.object({
  platformId: z.string(),
  symbol: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  currentPrice: z.number().positive(),
  purchaseDate: z.string().datetime(),
  currency: z.string().default('USD'),
  sector: z.string().optional(),
  notes: z.string().optional()
});

// Get all investments for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.user.userId },
      include: { platform: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Create investment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = investmentSchema.parse(req.body);
    
    const investment = await prisma.investment.create({
      data: {
        ...data,
        userId: req.user.userId,
        purchaseDate: new Date(data.purchaseDate)
      },
      include: { platform: true }
    });

    res.status(201).json(investment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create investment' });
  }
});

// Update investment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = investmentSchema.partial().parse(req.body);

    const investment = await prisma.investment.updateMany({
      where: { id, userId: req.user.userId },
      data: {
        ...data,
        ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) })
      }
    });

    if (investment.count === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update investment' });
  }
});

// Delete investment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.investment.deleteMany({
      where: { id, userId: req.user.userId }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

export default router;