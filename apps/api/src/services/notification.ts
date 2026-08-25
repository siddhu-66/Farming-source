import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import { Server } from 'socket.io';

export const createNotification = async (
  io: Server,
  data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
  }
) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        is_read: false,
        priority: 'medium'
      }])
      .select()
      .single();

    if (error) throw error;

    // Push real-time notification via Socket.IO
    io.to(`user_${data.userId}`).emit('notification', notification);

    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    return null;
  }
};

export const markAsRead = async (userId: string, notificationId?: string) => {
  if (notificationId) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
  } else {
    // Mark all as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) {
    logger.error('Failed to get unread count:', error);
    return 0;
  }
  
  return count || 0;
};

export const notifyMatchingBuyers = async (io: Server, listing: any) => {
  try {
    const { data: buyers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'buyer')
      .limit(5);

    if (buyers && buyers.length > 0) {
      for (const b of buyers) {
        await createNotification(io, {
          userId: b.id,
          type: 'listing_created',
          title: 'New Crop Listing',
          message: `A new listing for ${listing.crop_name || 'a crop'} is available in your district!`,
          link: `/buyer/marketplace/${listing.id}`
        });
      }
    }
  } catch (error) {
    logger.error('Failed to notify matching buyers:', error);
  }
};
