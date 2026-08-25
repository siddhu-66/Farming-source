import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Wind, Sun, Droplet, Sprout } from 'lucide-react';

export function EnvironmentalData() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">High</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">UV Index</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
            <p className="text-xs text-gray-500 mt-2">Avoid direct sunlight from 12 PM - 3 PM.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Wind className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full">Good</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Air Quality (AQI)</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">42</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">PM2.5: 12</span>
              <span className="text-xs text-gray-500">PM10: 24</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Droplet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Alert</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Soil Moisture</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">18%</p>
            <p className="text-xs text-red-500 mt-2 font-medium">Critically low. Irrigate soon.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full">Ideal</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Evapotranspiration</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">4.2 <span className="text-sm font-normal text-gray-500">mm/day</span></p>
            <p className="text-xs text-gray-500 mt-2">Normal for current growth stage.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
