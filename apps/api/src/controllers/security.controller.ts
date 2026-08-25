import { Request, Response, NextFunction } from 'express';
import { formatSuccess } from '../utils/formatResponse';
import securityService from '../services/security.service';

export const getUserEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const events = await securityService.getUserSecurityEvents(userId);
    res.json(formatSuccess('Security events retrieved', { events }));
  } catch (error) {
    next(error);
  }
};

export const getEventDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await securityService.getEventById(req.params.id as string);
    res.json(formatSuccess('Security event details retrieved', { event }));
  } catch (error) {
    next(error);
  }
};

// Admin Endpoints

export const getAdminEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      category: req.query.category
    };
    const events = await securityService.getAdminEvents(filters);
    res.json(formatSuccess('Admin security events retrieved', { events }));
  } catch (error) {
    next(error);
  }
};

export const acknowledgeEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user?.id;
    await securityService.acknowledgeEvent(req.params.id as string, adminId);
    res.json(formatSuccess('Security event acknowledged'));
  } catch (error) {
    next(error);
  }
};

export const resolveEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user?.id;
    const { resolutionNotes, adminAction } = req.body;
    await securityService.resolveEvent(req.params.id as string, adminId, resolutionNotes, adminAction);
    res.json(formatSuccess('Security event resolved'));
  } catch (error) {
    next(error);
  }
};
