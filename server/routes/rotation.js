/**
 * Crop rotation API - rule-based recommendations
 */
import express from 'express';
import { getRotationAdvice } from '../services/rotationService.js';

const router = express.Router();

/**
 * POST /api/rotation
 * Body: { soil: string, season: string, history: string }
 */
router.post('/', express.json(), async (req, res) => {
  try {
    const { soil = '', season = '', history = '' } = req.body;

    if (!soil?.trim() && !season?.trim() && !history?.trim()) {
      return res.status(400).json({
        error: 'Provide at least one of: soil, season, or history',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await getRotationAdvice(
      String(soil).trim(),
      String(season).trim(),
      String(history).trim()
    );
    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Failed to get rotation advice';
    console.error('Rotation API error:', message);
    res.status(statusCode).json({
      error: message,
      code: err.code || 'ROTATION_ERROR',
    });
  }
});

export default router;
