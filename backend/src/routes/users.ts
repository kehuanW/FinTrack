import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

const updateSettingsSchema = z.object({
  currency: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'zh']).optional(),
  notifications: z.object({
    priceAlerts: z.boolean().optional(),
    dailySummary: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    importCompleted: z.boolean().optional(),
  }).optional(),
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const data = updateUserSchema.parse(req.body);

    // Check if email is already taken (if updating email)
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: req.user.userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId: req.user.userId,
          currency: 'USD',
          theme: 'light',
          language: 'en',
          notifications: {
            priceAlerts: true,
            dailySummary: false,
            weeklyReport: true,
            importCompleted: true,
          },
        },
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: data,
      create: {
        userId: req.user.userId,
        ...data,
      },
    });

    res.json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid settings data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get user's portfolio summary
router.get('/portfolio/summary', authenticateToken, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.user.userId },
      include: { platform: true },
    });

    // Calculate portfolio metrics
    const totalValue = investments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.currentPrice.toString()) * parseFloat(inv.quantity.toString()));
    }, 0);

    const totalCost = investments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.purchasePrice.toString()) * parseFloat(inv.quantity.toString()));
    }, 0);

    const totalProfitLoss = totalValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    // Group by platform
    const platformSummary = investments.reduce((acc, inv) => {
      const platformName = inv.platform.name;
      const value = parseFloat(inv.currentPrice.toString()) * parseFloat(inv.quantity.toString());
      
      if (!acc[platformName]) {
        acc[platformName] = { count: 0, value: 0 };
      }
      
      acc[platformName].count += 1;
      acc[platformName].value += value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Group by sector
    const sectorSummary = investments.reduce((acc, inv) => {
      const sector = inv.sector || 'Other';
      const value = parseFloat(inv.currentPrice.toString()) * parseFloat(inv.quantity.toString());
      
      if (!acc[sector]) {
        acc[sector] = { count: 0, value: 0 };
      }
      
      acc[sector].count += 1;
      acc[sector].value += value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const summary = {
      totalInvestments: investments.length,
      totalValue,
      totalCost,
      totalProfitLoss,
      profitLossPercent,
      platformSummary,
      sectorSummary,
      topPerformers: investments
        .map(inv => ({
          symbol: inv.symbol,
          name: inv.name,
          profitLoss: (parseFloat(inv.currentPrice.toString()) - parseFloat(inv.purchasePrice.toString())) * parseFloat(inv.quantity.toString()),
          profitLossPercent: ((parseFloat(inv.currentPrice.toString()) - parseFloat(inv.purchasePrice.toString())) / parseFloat(inv.purchasePrice.toString())) * 100,
        }))
        .sort((a, b) => b.profitLossPercent - a.profitLossPercent)
        .slice(0, 5),
      worstPerformers: investments
        .map(inv => ({
          symbol: inv.symbol,
          name: inv.name,
          profitLoss: (parseFloat(inv.currentPrice.toString()) - parseFloat(inv.purchasePrice.toString())) * parseFloat(inv.quantity.toString()),
          profitLossPercent: ((parseFloat(inv.currentPrice.toString()) - parseFloat(inv.purchasePrice.toString())) / parseFloat(inv.purchasePrice.toString())) * 100,
        }))
        .sort((a, b) => a.profitLossPercent - b.profitLossPercent)
        .slice(0, 5),
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
});

// Get user's import history
router.get('/imports', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [imports, total] = await Promise.all([
      prisma.importHistory.findMany({
        where: { userId: req.user.userId },
        include: { platform: true },
        orderBy: { importedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.importHistory.count({
        where: { userId: req.user.userId },
      }),
    ]);

    res.json({
      imports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import history' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Verify password before deletion
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Delete user (this will cascade delete all related data)
    await prisma.user.delete({
      where: { id: req.user.userId },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Export user data (GDPR compliance)
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const [user, investments, importHistory, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.investment.findMany({
        where: { userId: req.user.userId },
        include: { platform: true, priceHistory: true },
      }),
      prisma.importHistory.findMany({
        where: { userId: req.user.userId },
        include: { platform: true },
      }),
      prisma.userSettings.findUnique({
        where: { userId: req.user.userId },
      }),
    ]);

    const exportData = {
      user,
      investments,
      importHistory,
      settings,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="investment-data-${user?.email}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;