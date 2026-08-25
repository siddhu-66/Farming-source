"use client";

import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Leaf, Droplet, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SUGGESTIONS = [
  { icon: Leaf, text: "Recommend fertilizer" },
  { icon: Search, text: "Detect crop disease" },
  { icon: TrendingUp, text: "Predict yield" },
  { icon: Droplet, text: "Check soil requirements" },
];

export function AiAssistantDrawer() {
  const { aiAssistantOpen, setAiAssistantOpen } = useUiStore();
  const { profile } = useDashboardStore();

  return (
    <AnimatePresence>
      {aiAssistantOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAiAssistantOpen(false)}
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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-500/10 to-transparent">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">AgriAssist AI</h2>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAiAssistantOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content (Chat Area) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {/* Welcome Message */}
              <div className="flex items-start space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm max-w-[85%]">
                  Hello {profile?.name ? profile.name.split(' ')[0] : 'there'}! I'm your digital farming assistant. How can I help you today?
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-auto space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1 mb-3">Quick Suggestions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button 
                      key={i}
                      className="flex items-center space-x-2 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800 transition-colors text-left group"
                    >
                      <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask anything about farming..." 
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1.5 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
