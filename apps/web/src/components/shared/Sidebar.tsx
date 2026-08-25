import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, ShoppingCart, Truck, Settings, Sprout, Tag, FileText, Landmark, BarChart3, CloudSun, Brain, CalendarDays, ShoppingBag, Recycle, MessageSquare, Bell, Wallet, User, Gavel, Package, Heart, MapPin, Route, CircleDollarSign, Warehouse, CreditCard, Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/stores/uiStore';

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const sidebarExpanded = useUiStore((state) => state.sidebarExpanded);
  
  const basePath = `/${role?.toLowerCase()}`;

  const getLinks = (userRole: string) => {
    if (!userRole) return [];
    const basePath = `/${userRole.toLowerCase()}`;
    const commonLinks = [
      { href: `/messages`, label: 'Messages', icon: MessageSquare },
      { href: `/notifications`, label: 'Notifications', icon: Bell },
      { href: `/wallet`, label: 'Wallet', icon: Wallet },
      { href: `/profile`, label: 'Profile', icon: User },
      { href: `/settings`, label: 'Settings', icon: Settings },
    ];

    switch (userRole.toLowerCase()) {
      case 'farmer':
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          { href: `${basePath}/marketplace`, label: 'Sell Crop', icon: ShoppingCart },
          { href: `${basePath}/crops`, label: 'My Crops', icon: Sprout },
          { href: `${basePath}/disease`, label: 'Disease Detect', icon: Stethoscope },
          { href: `${basePath}/offers`, label: 'Offers', icon: Tag },
          { href: `${basePath}/orders`, label: 'Orders', icon: Package },
          { href: `${basePath}/contracts`, label: 'Contracts', icon: FileText },
          { href: `${basePath}/waste`, label: 'Waste & Recycle', icon: Recycle },
          { href: `/schemes`, label: 'Schemes', icon: Landmark },
          { href: `${basePath}/transport`, label: 'Transport', icon: Truck },
          { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
          { href: `${basePath}/weather`, label: 'Weather', icon: CloudSun },
          { href: `${basePath}/assistant`, label: 'AI Assistant', icon: Brain },
          ...commonLinks
        ];
      case 'buyer':
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          { href: `${basePath}/marketplace`, label: 'Marketplace', icon: ShoppingCart },
          { href: `${basePath}/auctions`, label: 'Live Auctions', icon: Gavel },
          { href: `${basePath}/orders`, label: 'Orders', icon: Package },
          { href: `${basePath}/transport`, label: 'Transport', icon: Truck },
          { href: `${basePath}/saved`, label: 'Saved Farmers', icon: Heart },
          { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
          ...commonLinks
        ];
      case 'transport':
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          { href: `${basePath}/bookings`, label: 'Bookings', icon: CalendarDays },
          { href: `${basePath}/live-track`, label: 'Live Tracking', icon: MapPin },
          { href: `${basePath}/route`, label: 'Route Optimization', icon: Route },
          { href: `${basePath}/earnings`, label: 'Earnings', icon: CircleDollarSign },
          { href: `${basePath}/vehicles`, label: 'Vehicles', icon: Truck },
          ...commonLinks
        ];
      case 'industry':
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          { href: `${basePath}/procurement`, label: 'Waste Market', icon: ShoppingBag },
          { href: `${basePath}/warehouse`, label: 'Warehouse', icon: Warehouse },
          { href: `${basePath}/orders`, label: 'Orders', icon: Package },
          { href: `${basePath}/payments`, label: 'Payments', icon: CreditCard },
          { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
          ...commonLinks
        ];
      case 'admin':
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          { href: `${basePath}/marketplace`, label: 'Marketplace', icon: ShoppingCart },
          { href: `${basePath}/users`, label: 'Users', icon: Users },
          { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
          ...commonLinks
        ];
      default:
        return [
          { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
          ...commonLinks
        ];
    }
  };

  const links = getLinks(role || '');

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarExpanded && (
        <div 
          className="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden" 
          onClick={() => useUiStore.getState().toggleSidebar()} 
        />
      )}
      <aside 
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-all duration-300",
          sidebarExpanded ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0 lg:w-20"
        )}
      >
        <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={!sidebarExpanded ? link.label : undefined}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                sidebarExpanded ? 'space-x-3' : 'justify-center lg:justify-start lg:space-x-0'
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", !sidebarExpanded && "lg:mx-auto")} />
              <span className={cn("transition-opacity duration-300", !sidebarExpanded && "lg:hidden")}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      </aside>
    </>
  );
}
