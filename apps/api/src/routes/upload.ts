import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware';
import { uploadFile, uploadMultipleFiles } from '../services/storage';
import { createApiError } from '../middleware';

const router = Router();
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/webm', 'audio/mpeg']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed. Use JPEG, PNG, WebP, PDF, or supported audio.'));
  },
});

router.use(authenticate);

router.post('/single', upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw createApiError(400, 'No file provided');
    const folder = typeof req.body.folder === 'string' && /^[a-zA-Z0-9_/-]+$/.test(req.body.folder) ? req.body.folder : `uploads/${req.user!.role.toLowerCase()}`;
    const url = await uploadFile(req.file, folder);
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
});

router.post('/multiple', upload.array('files', 10), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw createApiError(400, 'No files provided');
    const folder = typeof req.body.folder === 'string' && /^[a-zA-Z0-9_/-]+$/.test(req.body.folder) ? req.body.folder : `uploads/${req.user!.role.toLowerCase()}`;
    const urls = await uploadMultipleFiles(files, folder);
    res.json({ success: true, data: { urls } });
  } catch (err) { next(err); }
});

export default router;
