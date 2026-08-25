import express from 'express';
import rolesRepo from '../repositories/roles.repository';
import { authenticate, authorizeRole } from '../middleware';

const router = express.Router();

router.use(authenticate);

// Get all roles
router.get('/', async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await rolesRepo.getAllRoles(includeInactive);
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

// Get role by ID
router.get('/:id', async (req, res, next) => {
  try {
    const role = await rolesRepo.getRoleById(req.params.id as string);
    res.json(role);
  } catch (err) {
    next(err);
  }
});

// Create role (Admin only)
router.post('/', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const role = await rolesRepo.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
});

// Update role (Admin only)
router.put('/:id', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const role = await rolesRepo.updateRole(req.params.id as string, req.body);
    res.json(role);
  } catch (err) {
    next(err);
  }
});

// Deactivate role (Admin only)
router.patch('/:id/status', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    let role;
    if (isActive === false) {
      role = await rolesRepo.deactivateRole(req.params.id as string);
    } else {
      role = await rolesRepo.updateRole(req.params.id as string, { is_active: true });
    }
    res.json(role);
  } catch (err) {
    next(err);
  }
});

// Delete role (Admin only)
router.delete('/:id', authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await rolesRepo.deleteRole(req.params.id as string);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
