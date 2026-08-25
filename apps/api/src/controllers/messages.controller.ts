import { Request, Response } from 'express';

export const getMessages = async (req: Request, res: Response) => {
  try {
    // Mock conversations for now
    res.status(200).json({
      success: true,
      data: [
        { id: "CONV-2034", name: "Ramesh (Buyer)", lastMessage: "Is the cotton still available?", time: "2m ago", unread: 2, online: true, pinned: true },
        { id: "CONV-2035", name: "Suresh (Transport)", lastMessage: "I will arrive at 10 AM tomorrow.", time: "1h ago", unread: 0, online: false, pinned: false },
        { id: "CONV-2036", name: "Admin Support", lastMessage: "Your profile has been verified.", time: "1d ago", unread: 0, online: true, pinned: false },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};
