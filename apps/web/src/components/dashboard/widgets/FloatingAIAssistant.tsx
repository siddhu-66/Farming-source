"use client";

import { useUiStore } from "@/stores/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function FloatingAIAssistant() {
  const { aiAssistantOpen, setAiAssistantOpen } = useUiStore();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hello! I am your AgriAssist AI. How can I help you today?" }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatHistory([...chatHistory, { role: "user", text: message }]);
    setMessage("");
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: "ai", text: "I'm a mock AI assistant. I'll be fully implemented soon!" }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {aiAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 h-8 w-8"
                onClick={() => setAiAssistantOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/20">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-card border shadow-sm rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t bg-background flex items-center space-x-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..." 
                className="flex-1 bg-transparent border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="icon" className="rounded-full shrink-0" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center focus:outline-none"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
