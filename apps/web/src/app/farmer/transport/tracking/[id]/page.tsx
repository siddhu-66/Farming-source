"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Truck, Navigation, Phone, CheckCircle, Package, Clock, ShieldAlert, MapPin, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import toast from "react-hot-toast";

import { useParams } from "next/navigation";

export default function LiveTracking() {
  const params = useParams();
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await api.get(`/api/transport/tracking/${params.id}`);
        if (res.data?.success) {
          setTracking(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!tracking) return <div>Tracking not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Live Shipment Tracking
            <span className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Live
            </span>
          </h1>
          <p className="text-muted-foreground">Booking ID: {tracking.bookingId.substring(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> Call Driver
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Need Help?
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative h-[500px] bg-slate-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/12/2924/1676.png')] bg-cover bg-center"></div>
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 200 300 Q 400 100 600 300" stroke="#059669" strokeWidth="4" fill="none" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
              </svg>
              
              <div className="absolute left-[180px] top-[280px]">
                <MapPin className="w-10 h-10 text-slate-400 drop-shadow-md" />
                <span className="font-bold text-sm bg-white/80 px-1 rounded absolute -bottom-5 -left-2 whitespace-nowrap">Pickup</span>
              </div>
              <div className="absolute left-[580px] top-[280px]">
                <Navigation className="w-10 h-10 text-red-500 drop-shadow-md" />
                <span className="font-bold text-sm bg-white/80 px-1 rounded absolute -bottom-5 -left-4 whitespace-nowrap">Destination</span>
              </div>

              <motion.div 
                className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-emerald-500"
                initial={{ x: -200, y: 100 }}
                animate={{ x: 200, y: -20 }} // Simulating movement along the curve
                transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              >
                <Truck className="w-6 h-6 text-emerald-600" />
              </motion.div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-6">Shipment Timeline</h3>
              <div className="relative pl-8 space-y-8 before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200">
                
                <div className="relative">
                  <div className="absolute -left-[39px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Booking Confirmed</h4>
                    <p className="text-sm text-slate-500">10:30 AM • Driver accepted the request</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[39px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white shadow-sm">
                    <Package className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Cargo Picked Up</h4>
                    <p className="text-sm text-slate-500">11:15 AM • 2.5 Tons of Tomato loaded</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[39px] w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-sm animate-pulse">
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-700">In Transit</h4>
                    <p className="text-sm text-slate-500">Current Location: {tracking.driverLocation}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[39px] w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm">
                    <Navigation className="w-3 h-3 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400">Delivery</h4>
                    <p className="text-sm text-slate-400">Estimated: {tracking.eta}</p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Status Update</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Speed</p>
                  <p className="font-bold text-lg">{tracking.speed}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">ETA</p>
                  <p className="font-bold text-lg">{tracking.eta}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Remaining</p>
                  <p className="font-bold text-lg">{tracking.distanceRemaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg border-b pb-2 mb-4">Driver Details</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Driver" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Ramesh Singh</h4>
                  <p className="text-sm text-slate-500">4.8 ★ • 120+ Trips</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded border text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-medium">Tata Ace (Mini Truck)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reg No.</span>
                  <span className="font-medium">DL-1T-4567</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
