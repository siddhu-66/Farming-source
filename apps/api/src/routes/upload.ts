import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware';
import { uploadFile, uploadMultipleFiles } from '../services/storage';
import { createApiError } from '../middleware';

const router = Router();

// Mock Virus Scan
const scanFileForViruses = async (file: Express.Multer.File): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1% chance of mocking a virus for demonstration
      if (Math.random() < 0.01) {
        reject(new Error('Security Scan Failed: Malware detected'));
      } else {
        resolve();
      }
    }, 500); // Simulate scanning delay
  });
};

// In-memory storage (files are piped to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/webm', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Use JPEG, PNG, WebP, PDF, or audio files.'));
    }
  },
});

router.use(authenticate);

// POST /api/upload/single — Upload one file
router.post('/single', upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw createApiError(400, 'No file provided');
    
    await scanFileForViruses(req.file);

    const folder = req.body.folder || `uploads/${req.user!.role}`;
    const url = await uploadFile(req.file, folder);
    res.json({ success: true, data: { url } });
  } catch (err: any) { 
    if (err.message.includes('Security Scan Failed')) {
      next(createApiError(400, err.message));
    } else {
      next(err); 
    }
  }
});

// POST /api/upload/multiple — Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw createApiError(400, 'No files provided');
    
    // Scan all files in parallel
    await Promise.all(files.map(scanFileForViruses));

    const folder = req.body.folder || `uploads/${req.user!.role}`;
    const urls = await uploadMultipleFiles(files, folder);
    res.json({ success: true, data: { urls } });
  } catch (err: any) { 
    if (err.message?.includes('Security Scan Failed')) {
      next(createApiError(400, err.message));
    } else {
      next(err); 
    }
  }
});

export default router;
