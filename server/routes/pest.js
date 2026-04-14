import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001/scan-pest';

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: 'scan.jpg',
      contentType: req.file.mimetype,
    });

    const response = await axios.post(ML_SERVICE_URL, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (err) {
    console.error('AR Scan Proxy Error:', err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.detail || 'Pest scan failed',
    });
  }
});

export default router;
