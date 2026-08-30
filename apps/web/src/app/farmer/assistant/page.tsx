"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mic, Camera, Shield, Cloud, IndianRupee, Sprout, Landmark, History, BookOpen, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const ACTIONS = [
  { title: "Chat with AI", icon: MessageSquare, route: "/farmer/assistant/chat", color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Voice Assistant", icon: Mic, route: "/farmer/assistant/voice", color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Diagnose Crop", icon: Camera, route: "/farmer/assistant/images", color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Knowledge Base", icon: BookOpen, route: "/farmer/assistant/knowledge", color: "text-indigo-600", bg: "bg-indigo-100" },
];

const QUICK_TOPICS = [
  { title: "Weather Advice", icon: Cloud, query: "What is the weather forecast for my farm today?" },
  { title: "Market Prices", icon: IndianRupee, query: "What are the latest mandi prices for tomatoes?" },
  { title: "Crop Health", icon: Sprout, query: "How do I identify nitrogen deficiency in paddy?" },
  { title: "Gov. Schemes", icon: Landmark, query: "What subsidies are available for drip irrigation?" },
];

export default function AssistantDashboard() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.data?.success) {
        setConversations(res.data.data.conversations.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      setConversations([
        { id: '1', title: 'Tomato early blight treatment', updated_at: new Date().toISOString() },
        { id: '2', title: 'Weather for next 3 days', updated_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    }
  };

  const handleQuickTopic = (query: string) => {
    sessionStorage.setItem('ai_initial_query', query);
    router.push('/farmer/assistant/chat');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, I'm your AgriAssist AI</h1>
          <p className="text-emerald-100 max-w-lg text-lg">How can I help you with your farm today? You can type, speak, or upload an image.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
          <Sprout className="w-64 h-64 -mb-16 -mr-16" />
        </div>
      </motion.div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIONS.map((action, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            onClick={() => router.push(action.route)}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-emerald-200 group h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className={`p-4 rounded-full ${action.bg} group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-8 h-8 ${action.color}`} />
                </div>
                <h3 className="font-bold text-slate-800">{action.title}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Topics */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" /> Smart Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_TOPICS.map((topic, idx) => (
              <Card 
                key={idx} 
                className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200"
                onClick={() => handleQuickTopic(topic.query)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <topic.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{topic.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{topic.query}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" /> Recent Chats
            </h2>
          </div>
          <Card>
            <CardContent className="p-0 divide-y">
              {conversations.map(conv => (
                <div key={conv.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => router.push(`/farmer/assistant/chat?id=${conv.id}`)}>
                  <p className="font-medium text-sm text-slate-800 line-clamp-1">{conv.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(conv.updated_at).toLocaleDateString()}</p>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">No recent conversations.</div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
