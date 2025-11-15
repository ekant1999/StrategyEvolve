import express from 'express';
import { getDemoTradesWithDates, expectedPatterns } from '../utils/seedDemoData';
import { fastinoService } from '../services/fastino';

const router = express.Router();

// Seed demo data endpoint
router.post('/seed', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }

    console.log('Seeding demo data for user:', userId);

    const demoTrades = getDemoTradesWithDates(userId);

    // Ingest all trades into Fastino
    let ingested = 0;
    for (const trade of demoTrades) {
      try {
        await fastinoService.ingestTrade(userId, trade);
        ingested++;
        console.log(`Ingested trade ${ingested}/${demoTrades.length}: ${trade.ticker}`);
      } catch (error) {
        console.error(`Failed to ingest trade ${trade.ticker}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        trades: demoTrades,
        ingested,
        total: demoTrades.length,
        expectedPatterns,
        message: `Seeded ${ingested} demo trades. Fastino Stage 3 will trigger automatically at trade thresholds.`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expected patterns for presentation
router.get('/patterns', (req, res) => {
  res.json({
    success: true,
    data: expectedPatterns,
  });
});

export default router;

