'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, X, MessageSquareText } from 'lucide-react';
import { Button } from '../ui/Button';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { useUiStore } from '@/stores/uiStore';

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

export function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'AgriAssist AI', 
      text: 'Hello! I am your AI assistant. I can help with crop recommendations, disease detection, market insights, and more. How can I assist you today?', 
      isMe: false, 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const { language } = useUiStore();
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      text: userMessage,
      isMe: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await api.post('/ai/chat', { message: userMessage, language });
      if (res.data.success) {
        let replyText = '';
        try {
          const parsed = JSON.parse(res.data.data.message.content);
          replyText = parsed.text;
          if (parsed.sources && parsed.sources.length > 0) {
            replyText += '\n\n**Sources:**\n' + parsed.sources.map((s: any) => `- [${s.title}](${s.url || '#'})`).join('\n');
          }
        } catch (e) {
          replyText = res.data.data.message.content; // fallback if plain string
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'AgriAssist AI',
          text: replyText,
          isMe: false,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error('Failed to get reply');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'AgriAssist AI',
        text: 'Sorry, I am having trouble connecting to the AI service right now. Please try again later.',
        isMe: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-colors"
          >
            <MessageSquareText className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[380px] h-[550px] z-50 flex flex-col border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-green-600 dark:bg-green-700 flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">AgriAssist AI</h3>
                  <p className="text-xs text-green-100">Powered by Gemini 2.0</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.map(msg => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-bl-sm shadow-sm'}`}>
                    {msg.isMe ? (
                      msg.text
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-bl-sm shadow-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2 relative">
                <input 
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 pr-12"
                  placeholder="Ask about crops, weather, schemes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="absolute right-1 top-1 rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md disabled:bg-gray-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
