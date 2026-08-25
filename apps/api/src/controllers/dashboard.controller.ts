import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const getDashboardBootstrap = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // 1. Fetch User Profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, status, onboarding_status, avatar_url, preferences')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error(`Error fetching user profile for dashboard bootstrap: ${profileError?.message}`);
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const role = profile.role.toLowerCase();

    // 2. Fetch Notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read_status', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      logger.error(`Error fetching notifications: ${notifError.message}`);
    }

    // 3. Generate Aggregated Mock Data based on Role
    
    // Statistics
    let statistics: any[] = [];
    switch (role) {
      case 'farmer':
        statistics = [
          { title: "Total Crops", value: "42", change: "+8%", trend: "up", lastUpdated: "2 min ago", icon: "🌾", route: "/farmer/crops" },
          { title: "Active Listings", value: "15", change: "+2%", trend: "up", lastUpdated: "5 min ago", icon: "📋", route: "/farmer/marketplace/listings" },
          { title: "Pending Orders", value: "3", change: "-1", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/farmer/orders" },
          { title: "Wallet Balance", value: "₹45,000", change: "+12%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/farmer/wallet" },
        ];
        break;
      case 'buyer':
        statistics = [
          { title: "Purchase Requests", value: "24", change: "+5%", trend: "up", lastUpdated: "10 min ago", icon: "🛒", route: "/buyer/procurement" },
          { title: "Active Suppliers", value: "142", change: "+12", trend: "up", lastUpdated: "Today", icon: "🤝", route: "/buyer/suppliers" },
          { title: "Pending Orders", value: "8", change: "-2", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/buyer/orders" },
          { title: "Total Spend", value: "₹2.4L", change: "+15%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/buyer/payments" },
        ];
        break;
      case 'transport':
        statistics = [
          { title: "Active Deliveries", value: "12", change: "+2", trend: "up", lastUpdated: "5 min ago", icon: "🚚", route: "/transport/deliveries" },
          { title: "Completed Trips", value: "156", change: "+18", trend: "up", lastUpdated: "Today", icon: "✅", route: "/transport/trips" },
          { title: "Available Vehicles", value: "8/15", change: "0", trend: "stable", lastUpdated: "10 min ago", icon: "🚛", route: "/transport/vehicles" },
          { title: "Earnings", value: "₹85,000", change: "+5%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/transport/earnings" },
        ];
        break;
      case 'industry':
        statistics = [
          { title: "Procurement Orders", value: "45", change: "+12%", trend: "up", lastUpdated: "5 min ago", icon: "🏭", route: "/industry/procurement" },
          { title: "Inventory Level", value: "78%", change: "-5%", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/industry/inventory" },
          { title: "Factory Capacity", value: "92%", change: "+2%", trend: "up", lastUpdated: "Today", icon: "⚙️", route: "/industry/factory" },
          { title: "Active Contracts", value: "28", change: "+3", trend: "up", lastUpdated: "Today", icon: "📄", route: "/industry/contracts" },
        ];
        break;
      case 'admin':
        statistics = [
          { title: "Total Users", value: "12,450", change: "+156", trend: "up", lastUpdated: "Just now", icon: "👥", route: "/admin/users" },
          { title: "Active Tickets", value: "45", change: "-12", trend: "down", lastUpdated: "5 min ago", icon: "🎫", route: "/admin/support" },
          { title: "System Health", value: "99.9%", change: "0", trend: "stable", lastUpdated: "Just now", icon: "⚡", route: "/admin/system" },
          { title: "Platform Revenue", value: "₹12.5L", change: "+18%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/admin/revenue" },
        ];
        break;
      default:
        statistics = [];
    }

    // Weather & Market
    const weather = {
      temp: 28,
      condition: 'Sunny',
      humidity: 65,
      location: 'Local Farm'
    };

    const market = [
      { crop: 'Wheat', price: 2100, trend: 'up' },
      { crop: 'Rice', price: 3200, trend: 'stable' },
      { crop: 'Corn', price: 1800, trend: 'down' }
    ];

    // Charts
    let charts: any = {};
    if (role === 'farmer') {
      charts = {
        title: 'Income vs Yield Trend',
        type: 'area',
        series: [
          { name: 'Jan', income: 4000, yield: 2400 },
          { name: 'Feb', income: 3000, yield: 1398 },
          { name: 'Mar', income: 2000, yield: 9800 },
          { name: 'Apr', income: 2780, yield: 3908 },
          { name: 'May', income: 1890, yield: 4800 },
          { name: 'Jun', income: 2390, yield: 3800 },
          { name: 'Jul', income: 3490, yield: 4300 }
        ]
      };
    } else {
      charts = {
        title: 'Monthly Activity',
        type: 'bar',
        series: [
          { name: 'Week 1', value: 40 },
          { name: 'Week 2', value: 30 },
          { name: 'Week 3', value: 80 },
          { name: 'Week 4', value: 50 }
        ]
      };
    }

    // Activity
    const activity = [
      { id: '1', title: 'Crop Listed', description: 'You listed 500kg of Wheat', time: '09:10 AM', icon: '🌾' },
      { id: '2', title: 'Buyer Sent Offer', description: 'Rajesh offered ₹2,100/quintal', time: '11:00 AM', icon: '💰' },
      { id: '3', title: 'Transport Assigned', description: 'Driver confirmed for tomorrow', time: '02:30 PM', icon: '🚚' }
    ];

    // Tasks
    const tasks = [
      { id: 't1', title: 'Crop Irrigation', due: 'Tomorrow, 6:00 AM', status: 'pending', priority: 'high' },
      { id: 't2', title: 'Harvest Schedule Review', due: 'In 3 days', status: 'pending', priority: 'medium' },
      { id: 't3', title: 'Fertilizer Application', due: 'Next Week', status: 'pending', priority: 'low' }
    ];

    // Orders
    const orders = [
      { id: 'ORD-123', target: 'Wheat', amount: '500kg', status: 'Pending', date: 'Today' },
      { id: 'ORD-124', target: 'Rice', amount: '1000kg', status: 'Completed', date: 'Yesterday' },
      { id: 'ORD-125', target: 'Corn', amount: '200kg', status: 'In Transit', date: '2 Days Ago' }
    ];

    let farmProfile = null;
    let landSummary = null;
    let currentSeason = null;

    if (role === 'farmer') {
      farmProfile = {
        name: profile.name,
        photo: profile.avatar_url,
        farmId: "FARM-7829",
        totalLand: "8 Acres",
        cultivatedLand: "6 Acres",
        soilType: "Black Cotton Soil",
        primaryCrop: "Cotton",
        farmingType: "Organic",
        verificationStatus: "Verified"
      };

      landSummary = {
        totalAcres: 8,
        irrigatedAcres: 5,
        rainFedAcres: 3,
        availableLand: 2,
        activeFields: 4
      };

      currentSeason = {
        name: "Kharif",
        duration: "June → October",
        recommendedActivity: "Apply Nitrogen Fertilizer",
        calendar: []
      };
    }

    // Default Widgets from Widget Engine based on role
    const defaultWidgets = role === 'farmer' ? [
      { id: 'farm_profile', type: 'farm_profile', visible: true, order: 0 },
      { id: 'land_summary', type: 'land_summary', visible: true, order: 1 },
      { id: 'current_season', type: 'current_season', visible: true, order: 2 },
      { id: 'weather', type: 'weather', visible: true, order: 3 },
      { id: 'market_overview', type: 'market_overview', visible: true, order: 4 },
      { id: 'analytics', type: 'analytics', visible: true, order: 5 },
      { id: 'activity', type: 'activity', visible: true, order: 6 },
      { id: 'tasks', type: 'tasks', visible: true, order: 7 },
      { id: 'orders', type: 'orders', visible: true, order: 8 },
      { id: 'marketplace', type: 'marketplace', visible: true, order: 9 },
      { id: 'government', type: 'government', visible: true, order: 10 },
      { id: 'voice', type: 'voice', visible: true, order: 11 },
    ] : [
      { id: 'analytics', type: 'analytics', visible: true, order: 0 },
      { id: 'activity', type: 'activity', visible: true, order: 1 },
      { id: 'tasks', type: 'tasks', visible: true, order: 2 },
      { id: 'orders', type: 'orders', visible: true, order: 3 },
      { id: 'marketplace', type: 'marketplace', visible: true, order: 4 },
      { id: 'government', type: 'government', visible: true, order: 5 },
      { id: 'voice', type: 'voice', visible: true, order: 6 },
    ];
    
    const savedWidgets = profile.preferences?.widgets || defaultWidgets;

    // 4. Construct Massive Payload
    const payload = {
      success: true,
      data: {
        profile: {
          name: profile.name,
          role: profile.role,
          status: profile.status,
          onboarding_status: profile.onboarding_status,
          avatar_url: profile.avatar_url
        },
        permissions: [],
        preferences: profile.preferences || {},
        notifications: notifications || [],
        widgets: savedWidgets, // Widget configuration
        statistics,
        charts,
        activity,
        tasks,
        orders,
        farmProfile,
        landSummary,
        currentSeason,
        external: {
          weather,
          market
        },
        socket: {
          channel: `${role}:${userId}`,
          url: process.env.SOCKET_URL || 'http://localhost:3000'
        }
      }
    };

    res.status(200).json(payload);
  } catch (error: any) {
    logger.error(`Dashboard bootstrap error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardHome = async (req: Request, res: Response): Promise<void> => {
  // Alias for getDashboardBootstrap for now
  return getDashboardBootstrap(req, res);
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role?.toLowerCase();

    if (!userId || !role) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let stats: any[] = [];

    switch (role) {
      case 'farmer':
        stats = [
          { title: "Total Crops", value: "42", change: "+8%", trend: "up", lastUpdated: "2 min ago", icon: "🌾", route: "/farmer/crops" },
          { title: "Active Listings", value: "15", change: "+2%", trend: "up", lastUpdated: "5 min ago", icon: "📋", route: "/farmer/marketplace/listings" },
          { title: "Pending Orders", value: "3", change: "-1", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/farmer/orders" },
          { title: "Wallet Balance", value: "₹45,000", change: "+12%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/farmer/wallet" },
        ];
        break;
      case 'buyer':
        stats = [
          { title: "Purchase Requests", value: "24", change: "+5%", trend: "up", lastUpdated: "10 min ago", icon: "🛒", route: "/buyer/procurement" },
          { title: "Active Suppliers", value: "142", change: "+12", trend: "up", lastUpdated: "Today", icon: "🤝", route: "/buyer/suppliers" },
          { title: "Pending Orders", value: "8", change: "-2", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/buyer/orders" },
          { title: "Total Spend", value: "₹2.4L", change: "+15%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/buyer/payments" },
        ];
        break;
      case 'transport':
        stats = [
          { title: "Active Deliveries", value: "12", change: "+2", trend: "up", lastUpdated: "5 min ago", icon: "🚚", route: "/transport/deliveries" },
          { title: "Completed Trips", value: "156", change: "+18", trend: "up", lastUpdated: "Today", icon: "✅", route: "/transport/trips" },
          { title: "Available Vehicles", value: "8/15", change: "0", trend: "stable", lastUpdated: "10 min ago", icon: "🚛", route: "/transport/vehicles" },
          { title: "Earnings", value: "₹85,000", change: "+5%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/transport/earnings" },
        ];
        break;
      case 'industry':
        stats = [
          { title: "Procurement Orders", value: "45", change: "+12%", trend: "up", lastUpdated: "5 min ago", icon: "🏭", route: "/industry/procurement" },
          { title: "Inventory Level", value: "78%", change: "-5%", trend: "down", lastUpdated: "1 hour ago", icon: "📦", route: "/industry/inventory" },
          { title: "Factory Capacity", value: "92%", change: "+2%", trend: "up", lastUpdated: "Today", icon: "⚙️", route: "/industry/factory" },
          { title: "Active Contracts", value: "28", change: "+3", trend: "up", lastUpdated: "Today", icon: "📄", route: "/industry/contracts" },
        ];
        break;
      case 'admin':
        stats = [
          { title: "Total Users", value: "12,450", change: "+156", trend: "up", lastUpdated: "Just now", icon: "👥", route: "/admin/users" },
          { title: "Active Tickets", value: "45", change: "-12", trend: "down", lastUpdated: "5 min ago", icon: "🎫", route: "/admin/support" },
          { title: "System Health", value: "99.9%", change: "0", trend: "stable", lastUpdated: "Just now", icon: "⚡", route: "/admin/system" },
          { title: "Platform Revenue", value: "₹12.5L", change: "+18%", trend: "up", lastUpdated: "Today", icon: "💰", route: "/admin/revenue" },
        ];
        break;
      default:
        stats = [];
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error(`Dashboard stats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardCharts = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req as any).user?.role?.toLowerCase() || 'farmer';
    let data: any = {};
    if (role === 'farmer') {
      data = {
        title: 'Income vs Yield Trend',
        type: 'area',
        series: [
          { name: 'Jan', income: 4000, yield: 2400 },
          { name: 'Feb', income: 3000, yield: 1398 },
          { name: 'Mar', income: 2000, yield: 9800 },
          { name: 'Apr', income: 2780, yield: 3908 },
          { name: 'May', income: 1890, yield: 4800 },
          { name: 'Jun', income: 2390, yield: 3800 },
          { name: 'Jul', income: 3490, yield: 4300 }
        ]
      };
    } else {
      data = {
        title: 'Monthly Activity',
        type: 'bar',
        series: [
          { name: 'Week 1', value: 40 },
          { name: 'Week 2', value: 30 },
          { name: 'Week 3', value: 80 },
          { name: 'Week 4', value: 50 }
        ]
      };
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = [
      { id: '1', title: 'Crop Listed', description: 'You listed 500kg of Wheat', time: '09:10 AM', icon: '🌾' },
      { id: '2', title: 'Buyer Sent Offer', description: 'Rajesh offered ₹2,100/quintal', time: '11:00 AM', icon: '💰' },
      { id: '3', title: 'Transport Assigned', description: 'Driver confirmed for tomorrow', time: '02:30 PM', icon: '🚚' }
    ];
    res.status(200).json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = [
      { id: 't1', title: 'Crop Irrigation', due: 'Tomorrow, 6:00 AM', status: 'pending', priority: 'high' },
      { id: 't2', title: 'Harvest Schedule Review', due: 'In 3 days', status: 'pending', priority: 'medium' },
      { id: 't3', title: 'Fertilizer Application', due: 'Next Week', status: 'pending', priority: 'low' }
    ];
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = [
      { id: 'ORD-123', target: 'Wheat', amount: '500kg', status: 'Pending', date: 'Today' },
      { id: 'ORD-124', target: 'Rice', amount: '1000kg', status: 'Completed', date: 'Yesterday' },
      { id: 'ORD-125', target: 'Corn', amount: '200kg', status: 'In Transit', date: '2 Days Ago' }
    ];
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const postDashboardPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { widgets } = req.body;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();
      
    const updatedPreferences = {
      ...(profile?.preferences || {}),
      widgets
    };

    await supabase
      .from('users')
      .update({ preferences: updatedPreferences })
      .eq('id', userId);

    res.status(200).json({ success: true, message: 'Preferences updated' });
  } catch (error: any) {
    logger.error(`Dashboard preferences error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
