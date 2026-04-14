/**
 * Agriculture market API routes - data.gov.in AGMARKNET
 */
import express from 'express';
import { fetchCommodityPrices } from '../services/marketService.js';

const router = express.Router();

/**
 * GET /api/market
 * GET /api/market?crops=Wheat,Rice,Gram
 * Fetches agriculture commodity prices (INR per quintal)
 */
router.get('/', async (req, res) => {
  try {
    const { crops } = req.query;
    const symbols = crops
      ? crops.split(',').map((s) => s.trim()).filter(Boolean)
      : null;

    const data = await fetchCommodityPrices(symbols);
    res.json(data);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Failed to fetch market data';
    console.error('Market API error:', message);
    const body = {
      error: message,
      code: err.code || 'MARKET_ERROR',
    };
    if (err.hint) body.hint = err.hint;
    res.status(statusCode).json(body);
  }
});

export default router;
