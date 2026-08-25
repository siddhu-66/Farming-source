"use client";

import { CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDashboardStore } from "@/stores/useDashboardStore";

export function UpcomingTasksWidget() {
  const { tasks, isInitializing: loading } = useDashboardStore();

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
    if (priority === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50';
  };

  if (loading) {
    return <div className="h-full w-full bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse min-h-[300px]" />;
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Upcoming Tasks
        </h3>
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 group hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{task.title}</h4>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <Clock className="h-3 w-3 mr-1" />
              {task.due}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="w-full bg-white dark:bg-gray-800 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                Snooze
              </Button>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2 opacity-50" />
            <p className="text-sm">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
