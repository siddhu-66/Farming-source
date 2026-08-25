"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Loader2, ArrowLeft, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Hello! I am your AI farming assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialQuery = sessionStorage.getItem('ai_initial_query');
    if (initialQuery) {
      sessionStorage.removeItem('ai_initial_query');
      setInput(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/v1/ai/chat', {
        message: userMsg,
        conversationId
      });

      if (res.data?.success) {
        setConversationId(res.data.data.conversationId);
        setMessages(prev => [...prev, { 
          id: res.data.data.message.id || Date.now().toString(), 
          role: 'assistant', 
          content: res.data.data.message.content 
        }]);
      }
    } catch (err) {
      toast.error("Failed to connect to AI");
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-slate-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Bot className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">AgriAssist AI</h2>
          <p className="text-xs text-emerald-600 font-medium">Online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-blue-600" /> : <Bot className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-emerald-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 rounded-tl-none flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="text-slate-500" onClick={() => router.push('/farmer/assistant/images')}>
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your farming question..."
            className="flex-1 bg-slate-50 border-transparent focus-visible:ring-emerald-500 rounded-full px-4"
          />
          <Button type="button" variant="ghost" size="icon" className="text-slate-500" onClick={() => router.push('/farmer/assistant/voice')}>
            <Mic className="w-5 h-5" />
          </Button>
          <Button type="submit" disabled={!input.trim() || loading} className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

    </div>
  );
}
