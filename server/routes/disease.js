/**
 * Disease detection API - Proxy to Python ML Service
 */
import express from 'express';
import multer from 'multer';
import { analyzeLeafImage } from '../services/diseaseService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * POST /api/disease
 * Body: Multipart Form Data with 'image' field
 * Analyzes leaf image for plant disease
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file uploaded. Please send a file in the "image" field.',
        code: 'VALIDATION_ERROR',
      });
    }

    // Pass the buffer and mimetype to the service
    const result = await analyzeLeafImage(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Failed to analyze image';
    const code = err.code || 'DISEASE_ERROR';
    
    console.error('Disease API error:', code, message);
    
    res.status(statusCode).json({
      error: message,
      code,
    });
  }
});

export default router;
