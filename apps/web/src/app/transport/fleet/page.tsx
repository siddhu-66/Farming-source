"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Users, Wrench, AlertCircle, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function FleetManagement() {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [data, setData] = useState<any>({ vehicles: [], drivers: [], maintenance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, driversRes, maintRes] = await Promise.all([
          api.get('/transport/dashboard'), // Has vehicles
          api.get('/transport/drivers'),
          api.get('/transport/fleet/maintenance')
        ]);
        
        setData({
          vehicles: vehiclesRes.data?.data?.vehicles || [],
          drivers: driversRes.data?.data?.drivers || [],
          maintenance: maintRes.data?.data?.records || []
        });
      } catch (err) {
        toast.error("Failed to load fleet data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your vehicles, drivers, and maintenance schedules.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'vehicles' ? 'Vehicle' : activeTab === 'drivers' ? 'Driver' : 'Maintenance Record'}
        </Button>
      </div>

      <div className="flex gap-4 border-b pb-2">
        <button 
          onClick={() => setActiveTab('vehicles')} 
          className={`px-4 py-2 font-medium ${activeTab === 'vehicles' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}
        >
          Vehicles ({data.vehicles.length})
        </button>
        <button 
          onClick={() => setActiveTab('drivers')} 
          className={`px-4 py-2 font-medium ${activeTab === 'drivers' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}
        >
          Drivers ({data.drivers.length})
        </button>
        <button 
          onClick={() => setActiveTab('maintenance')} 
          className={`px-4 py-2 font-medium ${activeTab === 'maintenance' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}
        >
          Maintenance ({data.maintenance.length})
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search vehicles by Reg No..." className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.vehicles.map((v: any) => (
                <Card key={v.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Truck className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">{v.vehicleNumber}</h3>
                      <p className="text-sm text-slate-500">{v.type} • {v.capacityWeight}kg Capacity</p>
                      <div className="mt-2">
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.drivers.map((d: any) => (
                <Card key={d.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                      <Users className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">{d.name}</h3>
                      <p className="text-sm text-slate-500">{d.phone}</p>
                      <p className="text-xs text-slate-400 mt-1">★ {d.rating} • {d.trips} Trips</p>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'available' ? 'bg-emerald-100 text-emerald-800' : d.status === 'on_trip' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                          {d.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.maintenance.map((m: any) => (
                <Card key={m.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${m.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {m.status === 'pending' ? <AlertCircle className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{m.vehicleNumber}</h3>
                        <p className="text-sm text-slate-500">{m.type}</p>
                        <p className="text-xs text-slate-400 mt-1">Date: {new Date(m.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{m.cost}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${m.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
