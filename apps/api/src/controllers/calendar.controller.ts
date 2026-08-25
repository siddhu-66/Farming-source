import { Request, Response } from 'express';

export const getEvents = async (req: Request, res: Response) => {
  try {
    // Mock calendar events for now
    res.status(200).json({
      success: true,
      data: [
        { id: 1, title: "Cotton Delivery", time: "Today, 2:00 PM", type: "delivery" },
        { id: 2, title: "Meeting with Buyer", time: "Tomorrow, 10:00 AM", type: "meeting" },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch calendar events' });
  }
};
