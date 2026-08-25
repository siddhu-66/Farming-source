import { Request, Response } from 'express';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Mock notifications for now
    res.status(200).json({
      success: true,
      data: [
        { id: 1, title: "Cotton price increased by ₹350/quintal", time: "5 minutes ago", read: false, icon: "📈", action: "View Market" },
        { id: 2, title: "Order #1024 has been shipped", time: "1 hour ago", read: false, icon: "🚛", action: "Track Order" },
        { id: 3, title: "New Government Scheme available", time: "2 hours ago", read: true, icon: "🏛️", action: "View Scheme" },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    res.status(200).json({ success: true, message: `Notification ${id || 'all'} marked as read` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};
