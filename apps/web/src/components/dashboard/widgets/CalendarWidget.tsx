"use client";

import { useUiStore } from "@/stores/uiStore";
import { Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

const MOCK_EVENTS = [
  { id: 1, title: "Cotton Delivery", time: "Today, 2:00 PM", type: "delivery" },
  { id: 2, title: "Meeting with Buyer", time: "Tomorrow, 10:00 AM", type: "meeting" },
];

export function CalendarWidget() {
  const { calendarOpen, setCalendarOpen } = useUiStore();

  return (
    <Dropdown 
      trigger={
        <Button variant="ghost" size="icon" className="hidden xl:flex">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      }
    >
      <div className="w-72 p-0">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-sm flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
            Upcoming Events
          </h3>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
            2 Today
          </span>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {event.time}
              </p>
            </div>
          ))}
          {MOCK_EVENTS.length === 0 && (
            <p className="text-sm text-center py-4 text-muted-foreground">No upcoming events</p>
          )}
        </div>
        
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="sm" className="w-full text-xs text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400">
            Open Full Calendar
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </Dropdown>
  );
}
