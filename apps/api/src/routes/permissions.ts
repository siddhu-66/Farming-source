import express from 'express';
import permissionsRepo from '../repositories/permissions.repository';
import { authenticate, authorizeRole } from '../middleware';

const router = express.Router();

router.use(authenticate);

// Get all permissions (Admin only)
router.get('/', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const permissions = await permissionsRepo.getAllPermissions(includeInactive);
    res.json(permissions);
  } catch (err) {
    next(err);
  }
});

// Create permission (Admin only)
router.post('/', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const permission = await permissionsRepo.createPermission(req.body);
    res.status(201).json(permission);
  } catch (err) {
    next(err);
  }
});

// Update permission (Admin only)
router.put('/:id', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const permission = await permissionsRepo.updatePermission(req.params.id as string, req.body);
    res.json(permission);
  } catch (err) {
    next(err);
  }
});

// Delete permission (Admin only)
router.delete('/:id', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await permissionsRepo.deletePermission(req.params.id as string);
    res.json({ message: 'Permission deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
