"use client";

import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { Menu, Search, Bell, Moon, Sun, Languages, Plus, Calendar, Sparkles, MessageSquare } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { WeatherWidget } from "../widgets/WeatherWidget";
import { MarketWidget } from "../widgets/MarketWidget";
import { PlatformStatus } from "../widgets/PlatformStatus";
import { CalendarWidget } from "../widgets/CalendarWidget";
import { LanguageSelector } from "../widgets/LanguageSelector";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/Dropdown";

export function TopBar() {
  const { toggleSidebar, setMobileSidebarOpen, setSearchOpen, setNotificationsOpen, setMessagesOpen, setAiAssistantOpen, theme, setTheme } = useUiStore();
  const { profile } = useDashboardStore();
  const router = useRouter();

  const role = profile?.role?.toLowerCase() || 'farmer';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleCreate = () => {
    switch(role) {
      case 'farmer': router.push('/farmer/crops/new'); break;
      case 'buyer': router.push('/buyer/procurement/new'); break;
      case 'transport': router.push('/transport/vehicles/new'); break;
      case 'industry': router.push('/industry/procurement/new'); break;
      case 'admin': router.push('/admin/announcements/new'); break;
      default: break;
    }
  };

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 lg:px-6 sticky top-0 z-20 shadow-sm">
      
      {/* Zone 1: Navigation Area */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-[200px]">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)} className="md:hidden flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block truncate">
          <Breadcrumbs />
        </div>
      </div>
      
      {/* Zone 2: Search Area */}
      <div className="flex-1 max-w-xl px-4 hidden md:flex items-center">
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search crops, farmers, orders... (Ctrl+K)</span>
        </Button>
      </div>

      {/* Zone 3: Quick Information & Zone 4 & 5 */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Search on mobile */}
        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="md:hidden flex-shrink-0">
          <Search className="h-5 w-5" />
        </Button>

        {/* Zone 3: Quick Info */}
        <WeatherWidget />
        <MarketWidget />
        <div className="hidden lg:block">
          <PlatformStatus />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden xl:block mx-1"></div>

        {/* Zone 4: Quick Actions */}
        <Button onClick={handleCreate} size="sm" className="hidden sm:flex bg-green-600 hover:bg-green-700 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
        <CalendarWidget />
        <Button variant="ghost" size="icon" className="hidden xl:flex text-purple-600 dark:text-purple-400" onClick={() => setAiAssistantOpen(true)}>
          <Sparkles className="h-5 w-5" />
        </Button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1"></div>

        {/* Zone 5: User Controls */}
        <LanguageSelector />
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setMessagesOpen(true)} className="relative hidden sm:flex shrink-0">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-950" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(true)} className="relative shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950" />
        </Button>
        
        <Dropdown trigger={
          <button className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold ml-1 hover:ring-2 hover:ring-green-500/50 transition-all shrink-0">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </button>
        }>
          <div className="w-56 p-2">
            <div className="px-2 py-1.5 mb-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email || 'user@example.com'}</p>
            </div>
            
            {/* Mobile fallbacks for hidden widgets */}
            <div className="sm:hidden mb-2 px-2 pb-2 border-b border-gray-100 dark:border-gray-800 flex justify-between">
               <Button onClick={toggleTheme} variant="outline" size="sm" className="w-[48%]">Theme</Button>
               <Button onClick={handleCreate} variant="outline" size="sm" className="w-[48%] border-green-200 text-green-700">Create</Button>
            </div>
            <div className="lg:hidden mb-2 px-2 pb-2 border-b border-gray-100 dark:border-gray-800">
               <PlatformStatus />
            </div>

            <button onClick={() => router.push(`/${role}/profile`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              My Profile
            </button>
            <button onClick={() => router.push(`/${role}/organization`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              My Organization
            </button>
            <button onClick={() => router.push(`/${role}/security`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Security
            </button>
            <button onClick={() => router.push(`/${role}/settings`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Account Settings
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>
            <button onClick={() => router.push(`/help`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Help
            </button>
            <button onClick={() => router.push(`/privacy`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => router.push(`/terms`)} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Terms
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }} 
              className="w-full text-left px-2 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
            >
              Log out
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
