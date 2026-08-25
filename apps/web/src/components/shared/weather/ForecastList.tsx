import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cloud, CloudRain, Sun, CloudSun, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

const hourlyData = [
  { time: '10 AM', temp: 34, icon: Sun, rain: 0, wind: 14 },
  { time: '11 AM', temp: 35, icon: Sun, rain: 0, wind: 15 },
  { time: '12 PM', temp: 36, icon: CloudSun, rain: 5, wind: 18 },
  { time: '1 PM', temp: 35, icon: Cloud, rain: 20, wind: 22 },
  { time: '2 PM', temp: 34, icon: CloudRain, rain: 82, wind: 25 },
  { time: '3 PM', temp: 32, icon: CloudRain, rain: 95, wind: 20 },
  { time: '4 PM', temp: 32, icon: CloudRain, rain: 60, wind: 15 },
  { time: '5 PM', temp: 31, icon: Cloud, rain: 30, wind: 12 },
];

const dailyData = [
  { day: 'Today', high: 36, low: 26, icon: CloudRain, rain: 82 },
  { day: 'Tomorrow', high: 35, low: 25, icon: CloudSun, rain: 30 },
  { day: 'Wed', high: 37, low: 26, icon: Sun, rain: 10 },
  { day: 'Thu', high: 38, low: 27, icon: Sun, rain: 0 },
  { day: 'Fri', high: 37, low: 26, icon: CloudSun, rain: 5 },
  { day: 'Sat', high: 35, low: 25, icon: Cloud, rain: 40 },
  { day: 'Sun', high: 34, low: 24, icon: CloudRain, rain: 60 },
];

export function ForecastList() {
  return (
    <div className="space-y-6">
      {/* Hourly Forecast */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x">
            {hourlyData.map((hour, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center justify-between min-w-[80px] p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 snap-start shrink-0"
              >
                <span className="text-sm font-medium text-gray-500">{hour.time}</span>
                <hour.icon className={`w-8 h-8 my-3 ${hour.rain > 50 ? 'text-blue-500' : 'text-orange-500'}`} />
                <span className="text-lg font-bold">{hour.temp}°</span>
                <div className="flex items-center text-xs text-blue-500 mt-2 font-medium">
                  <CloudRain className="w-3 h-3 mr-1" /> {hour.rain}%
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">7-Day Forecast</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">15-Day Extended</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyData.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="w-24 font-medium">{day.day}</span>
                <div className="flex items-center w-24 text-blue-500 text-sm font-medium">
                  {day.rain > 20 && (
                    <><CloudRain className="w-4 h-4 mr-2" /> {day.rain}%</>
                  )}
                </div>
                <day.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <div className="flex w-32 justify-end items-center gap-4 text-sm">
                  <span className="font-bold">{day.high}°</span>
                  <div className="h-1 flex-1 bg-gradient-to-r from-blue-300 to-orange-400 rounded-full opacity-50 mx-2"></div>
                  <span className="font-medium text-gray-500">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
