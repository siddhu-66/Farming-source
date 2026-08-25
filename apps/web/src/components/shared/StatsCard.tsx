import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h4 className="mt-2 text-3xl font-bold">{value}</h4>
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trend.value >= 0 ? 'text-green-500' : 'text-red-500'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="ml-2 text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
