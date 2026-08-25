import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocketIO = (io: Server): void => {
  // Authenticate socket connections with JWT
  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    logger.info(`Socket connected: ${userId} (${socket.userRole})`);

    // Auto-join user's personal room for notifications
    socket.join(`user_${userId}`);

    // Broadcast online status
    socket.broadcast.emit('user_online', userId);

    // ---- CHAT EVENTS ----

    socket.on('join_room', async (roomId: string) => {
      // Verify user is participant
      const { data: room } = await supabase.from('conversations').select('*').eq('id', roomId).maybeSingle();
      if (room && (room.participant_one === userId || room.participant_two === userId)) {
        socket.join(`room_${roomId}`);
        logger.info(`User ${userId} joined room ${roomId}`);
      }
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(`room_${roomId}`);
    });

    socket.on('send_message', async (data: { roomId: string; content: string; type?: string; fileUrl?: string }) => {
      try {
        const { data: room } = await supabase.from('conversations').select('*').eq('id', data.roomId).maybeSingle();
        if (!room || (room.participant_one !== userId && room.participant_two !== userId)) return;

        const { data: message, error } = await supabase.from('messages').insert([{
          conversation_id: data.roomId,
          sender_id: userId,
          message: data.content,
          attachment: data.fileUrl,
        }]).select('*, sender:users(full_name, avatar_url, role)').single();
        if (error) throw error;

        // Broadcast to all room members
        io.to(`room_${data.roomId}`).emit('new_message', message);

        // Send notifications to offline participants
        const otherParticipant = room.participant_one === userId ? room.participant_two : room.participant_one;
        io.to(`user_${otherParticipant}`).emit('notification', {
          type: 'chat',
          title: 'New Message',
          message: `${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
          link: `/chat?room=${data.roomId}`,
        });
      } catch (err) {
        logger.error('Socket send_message error:', err);
      }
    });

    socket.on('typing', (roomId: string) => {
      socket.to(`room_${roomId}`).emit('typing', { roomId, userId });
    });

    socket.on('stop_typing', (roomId: string) => {
      socket.to(`room_${roomId}`).emit('stop_typing', { roomId, userId });
    });

    socket.on('mark_read', async (data: { roomId: string }) => {
      // Chat read status not fully implemented in schema, stubbed for now
      logger.info(`mark_read for room ${data.roomId}`);
    });

    // ---- LOCATION TRACKING ----

    socket.on('send_location', (data: { bookingId: string; location: { lat: number; lng: number } }) => {
      // Broadcast to everyone tracking this booking
      io.to(`booking_${data.bookingId}`).emit('location_update', {
        bookingId: data.bookingId,
        location: data.location,
        timestamp: new Date(),
      });
    });

    socket.on('track_booking', (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
    });

    socket.on('stop_tracking', (bookingId: string) => {
      socket.leave(`booking_${bookingId}`);
    });

    // ---- DISCONNECT ----

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
      socket.broadcast.emit('user_offline', userId);
    });
  });
};
