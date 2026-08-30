"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Calendar, Battery, ArrowLeft, Loader2, Image as ImageIcon, Map, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function DroneManagement() {
  const router = useRouter();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/v1/iot/drone/missions');
      if (res.data?.success) {
        setMissions(res.data.data.missions || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch drone missions", err);
      setError(err.response?.data?.message || "Failed to load missions");
      toast.error("Failed to fetch drone missions");
    } finally {
      setLoading(false);
    }
  };

  const scheduleMission = async () => {
    setScheduling(true);
    try {
      const res = await api.post('/api/v1/iot/drone/missions', {
        missionType: 'crop_health'
      });
      if (res.data?.success) {
        toast.success("Drone mission scheduled");
        fetchMissions();
      }
    } catch (err) {
      toast.error("Failed to schedule mission");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Drone Management</h1>
            <p className="text-muted-foreground">Manage UAV surveys, view flight paths, and analyze imagery.</p>
          </div>
        </div>
        <Button onClick={scheduleMission} disabled={scheduling} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2">
          {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
          Schedule Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Active Fleet */}
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-600" /> Active Fleet
          </h2>
          <Card className="border-t-4 border-t-emerald-500 shadow-md relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">AgriDrone Pro V2</h3>
                  <p className="text-sm text-slate-500">ID: UAV-8842-Alpha</p>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                  <span className="font-bold text-emerald-600">Ready</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Battery className="w-3 h-3" /> Battery</span>
                  <span className="font-bold text-slate-800">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission History */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Mission Log
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-red-800">{error}</p>
                  <Button onClick={fetchMissions} variant="outline" size="sm" className="mt-3">Retry</Button>
                </CardContent>
              </Card>
            ) : missions.length === 0 ? (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-10 text-center text-slate-500 font-medium">
                  No drone missions found. Schedule a survey to get started.
                </CardContent>
              </Card>
            ) : (
              missions.map((mission, idx) => (
                <motion.div key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${mission.status === 'scheduled' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          <Plane className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 capitalize">{mission.missionType.replace('_', ' ')}</h3>
                          <p className="text-sm text-slate-500">{new Date(mission.createdAt).toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${mission.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {mission.status}
                            </span>
                            {mission.status !== 'scheduled' && (
                              <>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {mission.imagesCaptured || 0} Images</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Map className="w-3 h-3" /> 2.5 Acres</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {mission.status !== 'scheduled' && (
                        <Button variant="outline" size="sm" className="font-bold">
                          View Report
                        </Button>
                      )}

                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
