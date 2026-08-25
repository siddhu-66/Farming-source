"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Package, Camera, CheckCircle, Smartphone, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

// Mock data for a driver's active trip
const activeTrip = {
  id: "TRP-9876",
  crop: "Tomato",
  weight: "500 kg",
  pickup: "Farm 12, Nashik",
  dropoff: "Azadpur Mandi, Delhi",
  status: "assigned", // assigned, en_route_pickup, loading, in_transit, delivered
};

export default function DriverPortal() {
  const [status, setStatus] = useState(activeTrip.status);

  const handleNextStep = () => {
    switch (status) {
      case "assigned":
        setStatus("en_route_pickup");
        toast.success("Navigating to pickup!");
        break;
      case "en_route_pickup":
        setStatus("loading");
        toast.success("Arrived at pickup. Start loading.");
        break;
      case "loading":
        setStatus("in_transit");
        toast.success("Loading complete. Trip started!");
        break;
      case "in_transit":
        setStatus("delivered");
        toast.success("Delivery completed successfully!");
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 h-[calc(100vh-80px)] flex flex-col bg-slate-50 relative overflow-hidden shadow-2xl rounded-xl border mt-4">
      {/* Mobile-like header */}
      <div className="bg-emerald-600 text-white p-4 rounded-t-xl shrink-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">Driver App</h2>
          <p className="text-xs text-emerald-100">Vehicle: DL-1T-4567</p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        <h3 className="font-bold text-lg text-slate-800">Current Trip</h3>
        
        <Card className="border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">TRIP {activeTrip.id}</span>
                <h4 className="font-bold text-lg mt-2">{activeTrip.crop}</h4>
                <p className="text-sm text-slate-500">{activeTrip.weight}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase">Est. Payout</span>
                <p className="font-bold text-lg text-slate-800">₹4,500</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:inset-y-2 before:left-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10" />
                <p className="text-xs text-slate-500 font-bold mb-0.5">PICKUP</p>
                <p className="text-sm font-medium">{activeTrip.pickup}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[27px] w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${status === 'delivered' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <p className="text-xs text-slate-500 font-bold mb-0.5">DROPOFF</p>
                <p className="text-sm font-medium">{activeTrip.dropoff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Area */}
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center space-y-4">
          <AnimatePresence mode="wait">
            {status === 'assigned' && (
              <motion.div key="assigned" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <MapPin className="w-12 h-12 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-lg">New Trip Assigned</h4>
                  <p className="text-sm text-slate-500">Pickup is 5km away</p>
                </div>
                <Button onClick={handleNextStep} className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-14 rounded-xl">
                  <Navigation className="w-5 h-5 mr-2" /> Start Navigation
                </Button>
              </motion.div>
            )}

            {status === 'en_route_pickup' && (
              <motion.div key="en_route" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-50 bg-[url('https://maps.wikimedia.org/osm-intl/12/2924/1676.png')] bg-cover bg-center"></div>
                  <Navigation className="w-10 h-10 text-blue-600 relative z-10" />
                </div>
                <Button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14 rounded-xl">
                  Arrived at Pickup
                </Button>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <Package className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                <div>
                  <h4 className="font-bold text-lg">Loading Cargo</h4>
                  <p className="text-sm text-slate-500">Please verify the weight: {activeTrip.weight}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-14 rounded-xl">
                    <Camera className="w-5 h-5 mr-2" /> Take Photo
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1 bg-amber-600 hover:bg-amber-700 h-14 rounded-xl text-white">
                    Start Trip
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'in_transit' && (
              <motion.div key="in_transit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-50 bg-[url('https://maps.wikimedia.org/osm-intl/12/2924/1676.png')] bg-cover bg-center"></div>
                  <Truck className="w-10 h-10 text-emerald-600 relative z-10" />
                </div>
                <Button onClick={handleNextStep} className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-14 rounded-xl">
                  Complete Delivery
                </Button>
              </motion.div>
            )}

            {status === 'delivered' && (
              <motion.div key="delivered" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-2xl text-emerald-800">Trip Completed!</h4>
                  <p className="text-slate-500 mt-2">Earnings of ₹4,500 have been added to your wallet.</p>
                </div>
                <Button variant="outline" onClick={() => setStatus('assigned')} className="w-full mt-4">
                  Find Next Trip
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
