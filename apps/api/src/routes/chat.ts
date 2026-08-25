import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// GET /api/chat/rooms — Get my chat rooms
router.get('/rooms', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*, participants:users(id, full_name, avatar_url, role), last_message:chat_messages(*)')
      .eq('is_active', true)
      .contains('participants', [req.user!.id])
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { rooms } });
  } catch (err) { next(err); }
});

// POST /api/chat/rooms — Create or find direct chat room
router.post('/rooms', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { participantId, relatedOrder } = req.body;
    if (!participantId) throw createApiError(400, 'participantId required');

    // Check if room already exists
    let { data: room } = await supabase
      .from('chat_rooms')
      .select('*, participants:users(id, full_name, avatar_url, role)')
      .contains('participants', [req.user!.id, participantId])
      .eq('type', 'direct')
      .single();

    if (!room) {
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert([{
          participants: [req.user!.id, participantId],
          type: relatedOrder ? 'order' : 'direct',
          related_order: relatedOrder || null,
        }])
        .select('*, participants:users(id, full_name, avatar_url, role)')
        .single();
      
      if (createError) throw createError;
      room = newRoom;
    }
    res.json({ success: true, data: { room } });
  } catch (err) { next(err); }
});

// GET /api/chat/rooms/:roomId/messages
router.get('/rooms/:roomId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { before, limit = '50' } = req.query;

    // Verify user is participant
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', req.params.roomId)
      .single();
      
    if (!room || !room.participants.includes(req.user!.id)) {
      throw createApiError(403, 'Access denied');
    }

    let query = supabase
      .from('chat_messages')
      .select('*, sender_id:users(id, full_name, avatar_url, role)')
      .eq('room_id', req.params.roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', new Date(before as string).toISOString());
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    // Mark as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', req.params.roomId)
      .eq('is_read', false)
      .neq('sender_id', req.user!.id);

    res.json({ success: true, data: { messages: messages.reverse() } });
  } catch (err) { next(err); }
});

// POST /api/chat/rooms/:roomId/messages — Send message (REST fallback)
router.post('/rooms/:roomId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      content: z.string().min(1).max(5000),
      type: z.enum(['text', 'image', 'file', 'voice']).default('text'),
      fileUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const { data: room } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', req.params.roomId)
      .single();
      
    if (!room || !room.participants.includes(req.user!.id)) {
      throw createApiError(403, 'Access denied');
    }

    const { data: message, error: msgError } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: req.params.roomId,
        sender_id: req.user!.id,
        content: data.content,
        type: data.type,
        file_url: data.fileUrl,
      }])
      .select('*, sender_id:users(id, full_name, avatar_url, role)')
      .single();
      
    if (msgError) throw msgError;

    // Update room's last message
    await supabase
      .from('chat_rooms')
      .update({
        last_message: message.id,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', req.params.roomId);

    // Emit via Socket.IO
    const io = (req as any).io;
    if (io) {
      io.to(`room_${req.params.roomId}`).emit('new_message', message);
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

export default router;
