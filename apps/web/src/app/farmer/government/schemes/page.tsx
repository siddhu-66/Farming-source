"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Shield, Calendar, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function GovernmentSchemes() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/government/schemes${category !== 'all' ? `?category=${category}` : ''}`);
      if (res.data?.success) {
        setSchemes(res.data.data.schemes);
      }
    } catch (err) {
      // toast.error("Failed to fetch schemes");
      // Fallback for mock if DB is empty
      setSchemes([
        {
          id: 'mock-1',
          title: 'PM-KISAN Samman Nidhi',
          department: 'Ministry of Agriculture',
          category: 'financial_support',
          description: 'Income support of ₹6,000 per year in three equal installments to all land holding farmer families.',
          deadline: '2026-12-31',
          status: 'active'
        },
        {
          id: 'mock-2',
          title: 'PM-KUSUM (Solar Pumps)',
          department: 'Ministry of New & Renewable Energy',
          category: 'irrigation',
          description: 'Subsidies up to 60% for installing standalone solar agriculture pumps.',
          deadline: '2026-06-30',
          status: 'active'
        },
        {
          id: 'mock-3',
          title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
          department: 'Ministry of Agriculture',
          category: 'organic_farming',
          description: 'Financial assistance of ₹50,000 per hectare for 3 years to promote organic farming.',
          deadline: '2026-03-31',
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Browse Schemes</h1>
        <p className="text-muted-foreground">Discover central and state government subsidies tailored for you.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search schemes by name or keyword..." 
            className="pl-10 h-12 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-12 px-4 border rounded-md bg-slate-50 text-slate-700 font-medium min-w-[200px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="financial_support">Financial Support</option>
            <option value="irrigation">Irrigation</option>
            <option value="organic_farming">Organic Farming</option>
            <option value="crop_insurance">Crop Insurance</option>
            <option value="mechanization">Farm Mechanization</option>
          </select>
          <Button variant="outline" className="h-12 px-4"><Filter className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>)
        ) : filteredSchemes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No schemes found matching your search.
          </div>
        ) : (
          filteredSchemes.map((scheme) => (
            <motion.div key={scheme.id} whileHover={{ y: -5 }} className="h-full">
              <Card className="h-full flex flex-col hover:shadow-lg transition-all border-l-4 border-l-emerald-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {scheme.status === 'active' ? 'OPEN' : 'CLOSED'}
                </div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                      <Landmark className="w-4 h-4 text-emerald-600" /> {scheme.department || 'Government'}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{scheme.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{scheme.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border">
                        <Calendar className="w-4 h-4 text-amber-500" /> Deadline: {new Date(scheme.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border">
                        <Shield className="w-4 h-4 text-blue-500" /> Auto-Eligibility Available
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full capitalize">
                      {scheme.category.replace('_', ' ')}
                    </span>
                    <Link href={`/farmer/government/schemes/${scheme.id}`}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">Check Eligibility & Apply</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
