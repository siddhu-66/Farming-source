import {
  LayoutDashboard, ShoppingCart, Sprout, Package, FileText, Truck,
  BarChart3, CloudSun, Brain, Landmark, User, Shield, Warehouse, Factory, Heart, Users,
  MessageSquare, Bell, Calendar, Sparkles, Settings, ShieldCheck
} from "lucide-react";
import React from "react";

export interface MenuItem {
  title: string;
  route?: string;
  icon?: React.ElementType;
  badge?: number | string;
  children?: MenuItem[];
  permission?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface QuickAction {
  title: string;
  icon: React.ElementType;
  onClickRoute?: string;
  actionId?: string;
}

export interface RoleNavigation {
  role: string;
  groups: MenuGroup[];
  quickActions: QuickAction[];
}

const COMMON_BOTTOM_GROUP: MenuGroup = {
  title: "System",
  items: [
    { title: "Messages", route: "/messages", icon: MessageSquare, badge: 2 },
    { title: "Notifications", route: "/notifications", icon: Bell },
    { title: "Calendar", route: "/calendar", icon: Calendar },
    { title: "AI Assistant", route: "/ai", icon: Sparkles },
    { title: "Settings", route: "/settings", icon: Settings },
  ]
};

export const NAVIGATION_MATRIX: Record<string, RoleNavigation> = {
  FARMER: {
    role: "FARMER",
    quickActions: [
      { title: "Add Crop", icon: Sprout, onClickRoute: "/farmer/crops/new" },
      { title: "Sell Crop", icon: ShoppingCart, onClickRoute: "/farmer/marketplace/sell" },
      { title: "Book Transport", icon: Truck, onClickRoute: "/farmer/transport/book" },
    ],
    groups: [
      {
        title: "Workspace",
        items: [
          { title: "Dashboard", route: "/farmer/dashboard", icon: LayoutDashboard },
          { title: "Farm Profile", route: "/farmer/profile", icon: User },
          { title: "Land Management", route: "/farmer/land", icon: Warehouse },
          { title: "Crop Management", route: "/farmer/crops", icon: Sprout },
        ]
      },
      {
        title: "Network & Commerce",
        items: [
          { title: "Marketplace", route: "/farmer/marketplace", icon: ShoppingCart },
          { title: "Buyer Network", route: "/farmer/buyers", icon: Users },
          { title: "Transport", route: "/farmer/transport", icon: Truck },
          { title: "Contracts", route: "/farmer/contracts", icon: FileText },
        ]
      },
      {
        title: "Intelligence & Finance",
        items: [
          { title: "AI Assistant", route: "/farmer/ai", icon: Brain },
          { title: "Weather", route: "/farmer/weather", icon: CloudSun },
          { title: "Government Schemes", route: "/farmer/schemes", icon: Landmark },
          { title: "Wallet", route: "/farmer/wallet", icon: BarChart3 },
          { title: "Reports", route: "/farmer/reports", icon: BarChart3 },
        ]
      },
      {
        title: "System",
        items: [
          { title: "Messages", route: "/farmer/messages", icon: MessageSquare, badge: 2 },
          { title: "Notifications", route: "/farmer/notifications", icon: Bell },
          { title: "Security & Devices", route: "/farmer/security", icon: ShieldCheck },
          { title: "Settings", route: "/farmer/settings", icon: Settings },
        ]
      }
    ]
  },
  BUYER: {
    role: "BUYER",
    quickActions: [
      { title: "Find Farmers", icon: Users, onClickRoute: "/buyer/marketplace" },
      { title: "New Order", icon: ShoppingCart, onClickRoute: "/buyer/orders/new" },
    ],
    groups: [
      {
        title: "Core",
        items: [
          { title: "Dashboard", route: "/buyer/dashboard", icon: LayoutDashboard },
          { title: "Marketplace", route: "/buyer/marketplace", icon: ShoppingCart },
          { title: "Orders", route: "/buyer/orders", icon: Package },
        ]
      },
      {
        title: "Network",
        items: [
          { title: "Saved Farmers", route: "/buyer/saved", icon: Heart },
          { title: "Transport", route: "/buyer/transport", icon: Truck },
        ]
      },
      {
        title: "Analytics",
        items: [
          { title: "Analytics", route: "/buyer/analytics", icon: BarChart3 },
        ]
      },
      COMMON_BOTTOM_GROUP
    ]
  },
  TRANSPORT: {
    role: "TRANSPORT",
    quickActions: [
      { title: "Add Vehicle", icon: Truck, onClickRoute: "/transport/vehicles/add" },
      { title: "Update Location", icon: CloudSun, onClickRoute: "/transport/live-track" },
    ],
    groups: [
      {
        title: "Core",
        items: [
          { title: "Dashboard", route: "/transport/dashboard", icon: LayoutDashboard },
          { title: "Bookings", route: "/transport/bookings", icon: Package, badge: 3 },
          { title: "Vehicles", route: "/transport/vehicles", icon: Truck },
        ]
      },
      {
        title: "Operations",
        items: [
          { title: "Live Tracking", route: "/transport/live-track", icon: CloudSun },
          { title: "Route Optimizer", route: "/transport/route", icon: CloudSun },
          { title: "Earnings", route: "/transport/earnings", icon: Landmark },
        ]
      },
      COMMON_BOTTOM_GROUP
    ]
  },
  INDUSTRY: {
    role: "INDUSTRY",
    quickActions: [
      { title: "New Procurement", icon: Factory, onClickRoute: "/industry/procurement/new" },
      { title: "Capacity Report", icon: BarChart3, onClickRoute: "/industry/analytics" },
    ],
    groups: [
      {
        title: "Core",
        items: [
          { title: "Dashboard", route: "/industry/dashboard", icon: LayoutDashboard },
          { title: "Procurement", route: "/industry/procurement", icon: Factory },
          { title: "Warehouse", route: "/industry/warehouse", icon: Warehouse },
        ]
      },
      {
        title: "Operations",
        items: [
          { title: "Orders", route: "/industry/orders", icon: Package },
          { title: "Payments", route: "/industry/payments", icon: Landmark },
          { title: "Analytics", route: "/industry/analytics", icon: BarChart3 },
        ]
      },
      COMMON_BOTTOM_GROUP
    ]
  },
  ADMIN: {
    role: "ADMIN",
    quickActions: [
      { title: "Verify Accounts", icon: Shield, onClickRoute: "/admin/dashboard/verification" },
      { title: "Create User", icon: User, onClickRoute: "/admin/users/create" },
    ],
    groups: [
      {
        title: "Management",
        items: [
          { title: "Dashboard", route: "/admin/dashboard", icon: LayoutDashboard },
          { title: "Users", route: "/admin/users", icon: Users },
          { title: "Verification", route: "/admin/dashboard/verification", icon: Shield, badge: 12 },
          { title: "Marketplace", route: "/admin/marketplace", icon: ShoppingCart },
        ]
      },
      {
        title: "System",
        items: [
          { title: "Analytics", route: "/admin/analytics", icon: BarChart3 },
          { title: "Security", route: "/admin/security", icon: Shield },
        ]
      },
      COMMON_BOTTOM_GROUP
    ]
  }
};
