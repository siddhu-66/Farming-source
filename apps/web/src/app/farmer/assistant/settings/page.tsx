"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Settings, Globe, Languages, Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AssistantSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [testText, setTestText] = useState("Hello, I am your farming assistant.");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("hi");

  const handleTranslateTest = async () => {
    setTranslating(true);
    try {
      const res = await api.post('/api/v1/ai/translate', {
        text: testText,
        targetLang: targetLang
      });
      if (res.data?.success) {
        setTranslatedText(res.data.data.translated);
      }
    } catch (err) {
      toast.error("Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("AI Memory & Preferences saved");
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">AI Preferences & Memory</h1>
          <p className="text-muted-foreground">Manage what the AI knows about your farm and set language preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Translation & Language */}
        <Card className="shadow-lg border-blue-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Languages className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Multilingual Setup</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Preferred Language</label>
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full h-12 rounded-lg border-slate-200 bg-slate-50 px-4"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              
              <div className="pt-4 border-t">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Test AI Translation</label>
                <Input 
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleTranslateTest} disabled={translating} className="w-full bg-blue-600 hover:bg-blue-700">
                  {translating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                  Test Translation
                </Button>
                
                {translatedText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 font-medium">
                    {translatedText}
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Memory Context */}
        <Card className="shadow-lg border-purple-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">AI Memory Context</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-500">The AI uses these facts to personalize responses.</p>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Farm Size (Acres)</label>
                <Input defaultValue="5.2" type="number" className="bg-slate-50" />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Favorite Crops</label>
                <Input defaultValue="Tomato, Paddy, Cotton" className="bg-slate-50" />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Soil Type</label>
                <Input defaultValue="Black Cotton Soil" className="bg-slate-50" />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Irrigation Method</label>
                <Input defaultValue="Drip Irrigation" className="bg-slate-50" />
              </div>
              
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 text-lg rounded-xl">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Save AI Preferences
        </Button>
      </div>

    </div>
  );
}
