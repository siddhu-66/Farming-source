import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Paperclip, Mic, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

export function ChatInterface({ recipientName = "AgriAssist AI", showFileUpload = false }: { recipientName?: string, showFileUpload?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: recipientName, text: 'Hello! How can I help you today?', isMe: false, timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
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
    setIsTyping(true);

    try {
      const history = messages.slice(1).map(m => ({
        role: m.isMe ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const { data } = await api.post('/api/ai/chat', { 
        message: userMessage, 
        history 
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: recipientName,
        text: data.data.response,
        isMe: false,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      toast.error('AI Service is temporarily unavailable');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: recipientName,
        text: 'Sorry, I am having trouble connecting to the AI brain right now.',
        isMe: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 rounded-xl bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center">
        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary mr-3">
          <User className="h-5 w-5" />
        </div>
        <h3 className="font-semibold">{recipientName}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'} whitespace-pre-wrap`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl p-3 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 animate-pulse" /> AI is thinking...
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 items-center">
        {showFileUpload && (
          <>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0 text-gray-500">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0 text-gray-500">
              <Mic className="h-4 w-4" />
            </Button>
          </>
        )}
        <input 
          className="flex-1 rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} size="sm" className="rounded-full w-10 h-10 p-0 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
