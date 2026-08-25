"use client";

import React, { useState, useEffect } from "react";
import { Snowflake, PackageOpen, Thermometer, Droplets, Calendar, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WarehouseDashboard() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    warehouseName: "AgriCorp Cold Storage",
    cropName: "",
    expectedWeight: "",
    storageType: "cold",
    expectedArrival: "",
    durationDays: "7"
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/farmer/warehouse/inventory');
      if (res.data?.success) {
        setInventory(res.data.data.inventory);
      }
    } catch (err) {
      toast.error("Failed to fetch warehouse inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    try {
      const res = await api.post('/api/farmer/warehouse/book', {
        ...bookingForm,
        expectedWeight: Number(bookingForm.expectedWeight),
        durationDays: Number(bookingForm.durationDays)
      });
      if (res.data?.success) {
        toast.success("Storage booked successfully!");
        setBookingOpen(false);
        // In a real app we might refetch or add to a pending list
      }
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Storage & Warehousing</h1>
          <p className="text-muted-foreground">Manage your stored crops across cold and dry facilities.</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setBookingOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Book Storage Space
        </Button>
        
        <Dialog isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Book Storage Space">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crop Name</label>
                  <Input value={bookingForm.cropName} onChange={e => setBookingForm({...bookingForm, cropName: e.target.value})} placeholder="e.g. Potato" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input type="number" value={bookingForm.expectedWeight} onChange={e => setBookingForm({...bookingForm, expectedWeight: e.target.value})} placeholder="5000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Storage Type</label>
                  <select 
                    className="w-full h-10 px-3 py-2 border rounded-md text-sm"
                    value={bookingForm.storageType}
                    onChange={e => setBookingForm({...bookingForm, storageType: e.target.value})}
                  >
                    <option value="cold">Cold Storage (Fruits, Veg, Dairy)</option>
                    <option value="dry">Dry Warehouse (Grains, Pulses)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facility</label>
                  <select 
                    className="w-full h-10 px-3 py-2 border rounded-md text-sm"
                    value={bookingForm.warehouseName}
                    onChange={e => setBookingForm({...bookingForm, warehouseName: e.target.value})}
                  >
                    <option value="AgriCorp Cold Storage">AgriCorp Cold Storage (3km)</option>
                    <option value="National Dry Warehouse">National Dry Warehouse (12km)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Arrival Date</label>
                  <Input type="date" value={bookingForm.expectedArrival} onChange={e => setBookingForm({...bookingForm, expectedArrival: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <Input type="number" value={bookingForm.durationDays} onChange={e => setBookingForm({...bookingForm, durationDays: e.target.value})} />
                </div>
              </div>

              <Button onClick={handleBook} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                Confirm Booking
              </Button>
            </div>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventory.map((item) => (
          <Card key={item.id} className="overflow-hidden border-t-4 border-t-blue-500">
            <CardContent className="p-0">
              <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${item.storageType === 'cold' ? 'bg-blue-500' : 'bg-amber-600'}`}>
                    {item.storageType === 'cold' ? <Snowflake className="w-6 h-6" /> : <PackageOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.cropName}</h3>
                    <p className="text-sm text-slate-500">{item.warehouseName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">{item.weight} kg</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase">
                    {item.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 bg-white grid grid-cols-3 gap-4">
                {item.storageType === 'cold' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500 text-sm"><Thermometer className="w-4 h-4" /> Temp</div>
                      <p className="font-bold">{item.temperatureLogged}°C</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500 text-sm"><Droplets className="w-4 h-4" /> Humidity</div>
                      <p className="font-bold">{item.humidityLogged}%</p>
                    </div>
                  </>
                )}
                {item.storageType === 'dry' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500 text-sm"><Thermometer className="w-4 h-4" /> Temp</div>
                      <p className="font-bold">{item.temperatureLogged}°C</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500 text-sm"><Droplets className="w-4 h-4" /> Moisture</div>
                      <p className="font-bold">{item.humidityLogged}%</p>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 text-sm"><Calendar className="w-4 h-4" /> Stored On</div>
                  <p className="font-bold text-sm">{new Date(item.storedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {inventory.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl">
            <PackageOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No crops currently in storage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
