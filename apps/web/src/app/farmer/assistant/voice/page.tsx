"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowLeft, Loader2, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function VoiceAssistant() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("Tap the microphone to start speaking...");
  const [aiResponse, setAiResponse] = useState("");

  // Simulated Voice Recognition logic (since real STT requires active browser MediaRecorder setups and HTTPS context)
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      processAudio();
    } else {
      setIsRecording(true);
      setTranscript("Listening...");
      setAiResponse("");
      
      // Simulate listening transcription updates
      setTimeout(() => setTranscript("What is the..."), 1000);
      setTimeout(() => setTranscript("What is the weather..."), 2000);
      setTimeout(() => {
        setTranscript("What is the weather tomorrow?");
        setIsRecording(false);
        processAudio("What is the weather tomorrow?");
      }, 3500);
    }
  };

  const processAudio = async (finalTranscript?: string) => {
    setProcessing(true);
    setTranscript(finalTranscript || "Processing your voice...");
    try {
      const res = await api.post('/api/v1/ai/voice', { transcript: finalTranscript || "Hello" });
      if (res.data?.success) {
        setAiResponse(res.data.data.response);
        simulateTTS(res.data.data.response);
      }
    } catch (err) {
      toast.error("Voice processing failed.");
      setAiResponse("Sorry, I could not process your voice command.");
    } finally {
      setProcessing(false);
    }
  };

  const simulateTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl text-white relative">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-medium backdrop-blur-md">
          Voice Mode
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
        
        {/* Dynamic Text Area */}
        <div className="space-y-4 max-w-lg">
          <p className="text-emerald-400 font-medium h-8">
            {isRecording ? "Listening..." : processing ? "Processing..." : ""}
          </p>
          <h2 className="text-3xl font-medium leading-tight h-24 flex items-center justify-center">
            {transcript}
          </h2>
          {aiResponse && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">AgriAssist AI</span>
              </div>
              <p className="text-lg">{aiResponse}</p>
            </motion.div>
          )}
        </div>

        {/* Voice Visualizer (Simulated) */}
        <div className="h-24 flex items-end justify-center gap-2">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isRecording ? [20, Math.random() * 80 + 20, 20] : processing ? [20, 40, 20] : 10,
                opacity: isRecording || processing ? 1 : 0.3
              }}
              transition={{ repeat: Infinity, duration: isRecording ? 0.5 : 1, delay: i * 0.1 }}
              className={`w-3 rounded-t-full ${processing ? 'bg-blue-400' : 'bg-emerald-400'}`}
            />
          ))}
        </div>

        {/* Microphone Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={toggleRecording}
            disabled={processing}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-colors ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : processing ? 'bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-10 h-10" />}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
