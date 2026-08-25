'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Map, Settings, AlertTriangle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CurrentWeatherCard } from '@/components/shared/weather/CurrentWeatherCard';
import { ForecastList } from '@/components/shared/weather/ForecastList';
import { EnvironmentalData } from '@/components/shared/weather/EnvironmentalData';
import { Card, CardContent } from '@/components/ui/Card';

export default function WeatherDashboard() {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Intelligence</h1>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Primary Weather Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <CurrentWeatherCard />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ForecastList />
          </motion.div>
        </div>

        {/* Right Column - Env Data & Maps */}
        <div className="space-y-6">
          
          {/* AI Advisory */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-orange-500 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10">
              <div className="p-4 bg-orange-500 text-white flex items-center justify-between">
                <h3 className="font-bold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Farming Advice
                </h3>
                <AlertTriangle className="w-5 h-5 opacity-80" />
              </div>
              <CardContent className="p-4">
                <p className="text-orange-900 dark:text-orange-300 font-medium mb-2">
                  Heavy rainfall (82% probability) expected starting at 3:30 PM today.
                </p>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 list-disc pl-4">
                  <li>Delay planned irrigation.</li>
                  <li>Harvest mature crops before evening if possible.</li>
                  <li>Avoid fertilizer or pesticide application today to prevent runoff.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Environmental Data Grid */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Environmental Indicators</h3>
            <EnvironmentalData />
          </motion.div>

          {/* Satellite Map Mock */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold flex items-center">
                  <Map className="w-4 h-4 mr-2 text-primary" /> Satellite Map
                </h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-500">Live</span>
              </div>
              <div className="relative h-64 bg-gray-200 dark:bg-gray-800 w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-50 bg-[url('https://maps.wikimedia.org/osm-intl/12/2927/1770.png')] bg-cover bg-center mix-blend-overlay"></div>
                
                {/* Simulated Radar Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-blue-500/20"></div>
                <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-green-500/30 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500/30 rounded-full blur-2xl"></div>
                <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-yellow-500/30 rounded-full blur-xl"></div>
                
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <Button variant="secondary" size="sm" className="shadow-md">Layers</Button>
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-[0_0_15px_rgba(34,197,94,0.5)] mx-auto mb-1 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-900 drop-shadow-md bg-white/80 px-1 rounded">My Farm</span>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
