import { Request, Response } from 'express';

export const getTopbarConfig = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role || 'FARMER';
    
    // Mock response representing the dynamic config for the topbar
    res.status(200).json({
      success: true,
      data: {
        role: role.toUpperCase(),
        showWeather: ['FARMER', 'BUYER', 'INDUSTRY'].includes(role.toUpperCase()),
        showMarket: true,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch topbar configuration' });
  }
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || '';
    
    // In the future this will aggregate results from Crops, Farmers, Orders, Transport etc.
    res.status(200).json({
      success: true,
      data: {
        query,
        results: [
          // Mock results
          { id: "c1", category: "Crops", title: "Wheat Crop Listing", route: "/farmer/crops" },
          { id: "f1", category: "People", title: "John Doe (Farmer)", route: "/admin/users" },
          { id: "o1", category: "Orders", title: "Order #1024", route: "/buyer/orders" },
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to execute global search' });
  }
};

export const getWeatherSummary = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        temp: 32,
        condition: '☀️',
        rain: 20,
        wind: 14,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch weather summary' });
  }
};

export const getMarketSummary = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        up: 'Cotton',
        down: 'Tomato'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch market summary' });
  }
};

export const getBreadcrumbs = async (req: Request, res: Response) => {
  try {
    const path = req.query.path as string || '/';
    const parts = path.split('/').filter(Boolean);
    
    // Mock response: we rely on frontend generation primarily, 
    // but backend can override labels for UUIDs
    res.status(200).json({
      success: true,
      data: {
        path,
        breadcrumbs: parts.map(p => ({ label: p.toUpperCase(), href: `/${p}` }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate breadcrumbs' });
  }
};
