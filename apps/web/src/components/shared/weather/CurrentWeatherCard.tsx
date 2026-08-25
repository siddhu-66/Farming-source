import { Card, CardContent } from '@/components/ui/Card';
import { CloudSun, Wind, Droplets, Gauge, Eye, Sunrise, Sunset } from 'lucide-react';
import { motion } from 'framer-motion';

export function CurrentWeatherCard() {
  return (
    <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <CloudSun className="w-48 h-48" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl font-bold">Ahmedabad, Gujarat</h2>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Updated 10:45 AM</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <CloudSun className="w-16 h-16" />
              <div>
                <p className="text-6xl font-light">34°C</p>
                <p className="text-lg font-medium opacity-90">Mostly Sunny</p>
              </div>
            </div>
            <p className="text-sm opacity-80 pt-2">Feels Like: 37°C</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 bg-black/10 p-4 rounded-xl backdrop-blur-sm w-full md:w-auto">
            <div className="flex items-center space-x-3">
              <Droplets className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Humidity</p>
                <p className="font-semibold">58%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Wind className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Wind</p>
                <p className="font-semibold">14 km/h NW</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Gauge className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Pressure</p>
                <p className="font-semibold">1008 hPa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Visibility</p>
                <p className="font-semibold">9 km</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Sunrise className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Sunrise</p>
                <p className="font-semibold">6:12 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Sunset className="w-5 h-5 opacity-70" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Sunset</p>
                <p className="font-semibold">7:08 PM</p>
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
