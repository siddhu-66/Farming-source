'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowLeft, Camera, Sprout, Beaker, MessageSquare, CloudSun, TrendingUp, Presentation, Clock, ChevronRight } from 'lucide-react';
import { ChatInterface } from '@/components/shared/ChatInterface';
import { useRouter } from 'next/navigation';
import { DiseaseScanner } from '@/components/farmer/ai/DiseaseScanner';
import { CropRecommender } from '@/components/farmer/ai/CropRecommender';
import { FertilizerAdvisor } from '@/components/farmer/ai/FertilizerAdvisor';
import { useAuthStore } from '@/stores/authStore';

type ActiveTool = 'chat' | 'disease' | 'crop' | 'fertilizer' | 'market' | 'finance' | 'transport' | 'yield' | null;

export default function AiAssistantPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTool, setActiveTool] = useState<ActiveTool>('chat');

  // Define tools and gate them based on user role
  const allTools = [
    { id: 'chat', label: 'Ask AI Chat', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-100', roles: ['farmer', 'buyer', 'industry', 'transport', 'admin'] },
    { id: 'market', label: 'Market Forecast', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-100', roles: ['farmer', 'buyer', 'industry', 'admin'] },
    { id: 'disease', label: 'Scan Crop', icon: Camera, color: 'text-red-500', bg: 'bg-red-100', roles: ['farmer', 'admin'] },
    { id: 'crop', label: 'Recommend Crop', icon: Sprout, color: 'text-green-500', bg: 'bg-green-100', roles: ['farmer', 'admin'] },
    { id: 'fertilizer', label: 'Fertilizer Guide', icon: Beaker, color: 'text-purple-500', bg: 'bg-purple-100', roles: ['farmer', 'admin'] },
    { id: 'yield', label: 'Yield Predictor', icon: Presentation, color: 'text-teal-500', bg: 'bg-teal-100', roles: ['farmer', 'admin'] },
  ];

  const allowedTools = allTools.filter(tool => user && tool.roles.includes(user.role));

  const recentConversations = [
    { title: 'Best pesticide for tomato blight', time: '2 hours ago' },
    { title: 'Wheat MSP trends in Punjab', time: '1 day ago' },
  ];

  const insights = [
    { title: 'Heavy rain expected tomorrow. Delay spraying fertilizers.', icon: CloudSun, color: 'text-blue-500' },
    { title: 'Soybean prices up 5% in local APMC this week.', icon: TrendingUp, color: 'text-green-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
              <Sparkles className="mr-2 h-8 w-8 text-primary" /> AgriAssist AI Hub
            </h1>
            <p className="text-gray-500 mt-1">Intelligent decision support tailored for {user?.role || 'you'}.</p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              Gemini 2.0 Flash Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar (Quick Actions & Insights) */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              {allowedTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ActiveTool)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTool === tool.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-md mr-3 ${activeTool === tool.id ? tool.bg : 'bg-gray-100 dark:bg-gray-800'} ${activeTool === tool.id ? tool.color : 'text-gray-500'}`}>
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left text-sm">{tool.label}</span>
                  {activeTool === tool.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentConversations.map((conv, i) => (
                <div key={i} className="cursor-pointer group">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary line-clamp-1">{conv.title}</p>
                  <p className="text-xs text-gray-500">{conv.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Today's Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-3">
                  <insight.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${insight.color}`} />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{insight.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 min-h-[600px] relative">
          <AnimatePresence mode="wait">
            
            {activeTool === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="h-[700px] border rounded-xl overflow-hidden shadow-sm"
              >
                <ChatInterface recipientName="AgriAssist AI" showFileUpload />
              </motion.div>
            )}

            {activeTool === 'market' && (
              <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                <Card className="h-[700px] flex items-center justify-center bg-gray-50/50">
                  <div className="text-center p-8 max-w-sm">
                    <TrendingUp className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Market Forecast Engine</h3>
                    <p className="text-gray-500 text-sm mb-6">Analyze historical trends and predict future prices across APMC mandis using AI.</p>
                    <Button onClick={() => setActiveTool('chat')} className="w-full">Ask AI about prices</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTool === 'disease' && (
              <motion.div key="disease" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DiseaseScanner />
              </motion.div>
            )}

            {activeTool === 'crop' && (
              <motion.div key="crop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CropRecommender />
              </motion.div>
            )}

            {activeTool === 'fertilizer' && (
              <motion.div key="fertilizer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <FertilizerAdvisor />
              </motion.div>
            )}

            {activeTool === 'yield' && (
              <motion.div key="yield" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="h-[700px] flex items-center justify-center bg-gray-50/50">
                  <div className="text-center p-8 max-w-sm">
                    <Presentation className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Yield Predictor</h3>
                    <p className="text-gray-500 text-sm mb-6">Use machine learning to estimate your seasonal yield based on soil, weather, and crop data.</p>
                    <Button onClick={() => setActiveTool('chat')} className="w-full">Chat with AI about yield</Button>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
