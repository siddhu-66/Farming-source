"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Sparkles, User, Sun, Moon, CloudSun, Sunset, MapPin, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function WelcomeBanner() {
  const { profile } = useDashboardStore();
  const { setAiAssistantOpen } = useUiStore();
  const router = useRouter();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: SunriseIcon };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: SunIcon };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: SunsetIcon };
    return { text: "Welcome Back", icon: MoonIcon };
  };

  const { text: greeting, icon: GreetingIcon } = getGreeting();
  const role = profile?.role?.toLowerCase() || 'farmer';
  const name = profile?.name ? profile.name.split(' ')[0] : 'User';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
        <GreetingIcon className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-500 mb-2">
          <GreetingIcon className="w-5 h-5" />
          <span className="font-semibold">{greeting}, {name}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to AgriAssist
        </h1>
        
        {role === 'farmer' ? (
          <div className="mb-6 space-y-1">
            <p className="text-muted-foreground flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-1.5" />
              Village: Kurnool • District: Kurnool • State: AP
            </p>
            <p className="text-muted-foreground flex items-center text-sm">
              <Sprout className="w-4 h-4 mr-1.5" />
              Current Season: Kharif • Farm Status: Healthy
            </p>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 inline-flex items-center px-2 py-1 rounded-md mt-2">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Message: Good rainfall expected this week.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            <br/>
            Today is a great day to monitor your operations.
          </p>
        )}

        <div className="flex items-center space-x-3">
          <Button onClick={() => router.push(`/${role}/profile`)} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          <Button onClick={() => setAiAssistantOpen(true)} variant="outline" className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Icon fallbacks
const SunriseIcon = CloudSun;
const SunIcon = Sun;
const SunsetIcon = Sunset;
const MoonIcon = Moon;
