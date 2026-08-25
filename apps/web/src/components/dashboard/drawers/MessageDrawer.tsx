"use client";

import { useUiStore } from "@/stores/uiStore";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Search, Pin } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock data
const MESSAGES = [
  { id: "CONV-2034", name: "Ramesh (Buyer)", lastMessage: "Is the cotton still available?", time: "2m ago", unread: 2, online: true, pinned: true },
  { id: "CONV-2035", name: "Suresh (Transport)", lastMessage: "I will arrive at 10 AM tomorrow.", time: "1h ago", unread: 0, online: false, pinned: false },
  { id: "CONV-2036", name: "Admin Support", lastMessage: "Your profile has been verified.", time: "1d ago", unread: 0, online: true, pinned: false },
];

export function MessageDrawer() {
  const { messagesOpen, setMessagesOpen } = useUiStore();

  return (
    <AnimatePresence>
      {messagesOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMessagesOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <h2 className="font-semibold text-lg">Messages</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMessagesOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {MESSAGES.map(msg => (
                <div 
                  key={msg.id} 
                  className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {msg.name.charAt(0)}
                    </div>
                    {msg.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-sm truncate">{msg.name}</span>
                        {msg.pinned && <Pin className="h-3 w-3 text-muted-foreground shrink-0" />}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{msg.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${msg.unread > 0 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {msg.lastMessage}
                      </p>
                      {msg.unread > 0 && (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 ml-2">
                          {msg.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <Button variant="ghost" className="text-green-600 dark:text-green-400 w-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300">
                View All Messages
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
