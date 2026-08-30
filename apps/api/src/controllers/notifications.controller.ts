import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { markAsRead, getUnreadCount } from '../services/notification';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import { createApiError } from '../middleware';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { isRead } = req.query;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data: notifications, count: total, error } = await query.range(skip, skip + limit - 1);

    if (error) throw error;

    const unreadCount = await getUnreadCount(req.user!.id);

    const mappedNotifications = notifications?.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      metadata: n.metadata,
      isRead: n.is_read,
      createdAt: n.created_at,
      priority: n.priority || 'medium'
    })) || [];

    res.json({
      success: true,
      data: {
        notifications: mappedNotifications,
        unreadCount,
        ...buildPaginationResponse(total || 0, page, limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params.id as string) || req.body.id;
    await markAsRead(req.user!.id, id);
    const unreadCount = await getUnreadCount(req.user!.id);
    res.json({ success: true, data: { unreadCount } });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await markAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read', data: { unreadCount: 0 } });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

export const notifyBuyersOfListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listing } = req.body;
    if (!listing) throw createApiError(400, 'Listing data is required');

    // Fetch mock buyers from the same district
    const { data: buyers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'buyer')
      .limit(5);

    if (buyers && buyers.length > 0) {
      const notifications = buyers.map(b => ({
        user_id: b.id,
        title: 'New Crop Listing',
        message: `A new listing for ${listing.crop_name || 'a crop'} is available in your district!`,
        is_read: false
      }));

      await supabase.from('notifications').insert(notifications);
    }

    res.json({ success: true, message: 'Matching buyers notified' });
  } catch (err) {
    next(err);
  }
};
