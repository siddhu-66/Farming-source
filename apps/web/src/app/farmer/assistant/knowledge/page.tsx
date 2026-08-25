"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Loader2, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function KnowledgeBase() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/api/v1/ai/knowledge/search?q=${encodeURIComponent(query)}`);
      if (res.data?.success) {
        setResults(res.data.data.results);
      }
    } catch (err) {
      toast.error("Failed to search knowledge base.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Knowledge Base</h1>
          <p className="text-muted-foreground">Search through thousands of agricultural articles and guidelines using AI.</p>
        </div>
      </div>

      <Card className="border-emerald-200 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="E.g., How to treat early blight in tomatoes?"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-emerald-500 text-lg"
              />
            </div>
            <Button type="submit" disabled={!query.trim() || loading} className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center text-slate-400 border-2 border-dashed rounded-3xl">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">Enter a query above to search the RAG vector database.</p>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center text-emerald-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium animate-pulse">Searching vector database...</p>
            </motion.div>
          )}

          {!loading && hasSearched && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <p className="font-medium text-slate-500">Found {results.length} relevant documents</p>
              {results.map((res, idx) => (
                <Card key={idx} className="hover:border-emerald-500 transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                        {res.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400">Match: {(res.score * 100).toFixed(1)}%</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-2">{res.snippet}</p>
                    <div className="mt-4 flex items-center text-emerald-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Read Article <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center text-slate-500 border-2 border-dashed rounded-3xl">
              <p className="text-lg">No relevant articles found for your query.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
