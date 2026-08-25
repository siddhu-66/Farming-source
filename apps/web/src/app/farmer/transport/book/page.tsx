"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, MapPin, Package, Calendar, CheckCircle2, Navigation, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function BookTransport() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);

  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    weight: "",
    pickupAddress: "",
    deliveryAddress: "",
    pickupTime: "",
    vehicleType: "Mini Truck",
    temperatureRequirement: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEstimate = async () => {
    // Basic validation
    if (!formData.weight || !formData.pickupAddress || !formData.deliveryAddress) {
      toast.error("Please fill in weight and locations");
      return;
    }
    
    setLoading(true);
    try {
      // For demo, we just simulate the distance
      const distanceKm = 120; 
      const res = await api.post('/api/transport/calculate-fare', {
        distanceKm,
        weightKg: Number(formData.weight),
        vehicleType: formData.vehicleType.toLowerCase().replace(' ', '_')
      });
      
      if (res.data?.success) {
        setEstimation(res.data.data);
        setStep(3);
      }
    } catch (err) {
      toast.error("Failed to estimate fare");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/transport/book', {
        ...formData,
        quantity: Number(formData.quantity) || 1,
        weight: Number(formData.weight),
        pickupAddress: { address: formData.pickupAddress },
        deliveryAddress: { address: formData.deliveryAddress },
        estimatedFreight: estimation?.totalFare
      });

      if (res.data?.success) {
        toast.success("Transport booked successfully!");
        router.push(`/farmer/transport/tracking/${res.data.data.booking.id}`);
      }
    } catch (err) {
      toast.error("Failed to book transport");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Book Transport</h1>
        <p className="text-muted-foreground">Find the right vehicle to move your harvest safely and efficiently.</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: "Logistics Details" },
          { num: 2, label: "Vehicle & Time" },
          { num: 3, label: "Estimate & Confirm" }
        ].map((s, idx) => (
          <div key={s.num} className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= s.num ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-300'}`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-xs font-medium ${step >= s.num ? 'text-emerald-700' : 'text-slate-400'}`}>{s.label}</span>
            {idx < 2 && (
              <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${step > s.num ? 'bg-emerald-600' : 'bg-slate-200'}`} style={{ transform: 'translateX(50%)' }} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" /> Cargo Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Crop Name</label>
                      <Input name="cropName" value={formData.cropName} onChange={handleChange} placeholder="e.g. Tomato" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Total Weight (kg)</label>
                      <Input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Locations
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Pickup Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <Input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="pl-9" placeholder="Enter farm or warehouse address" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Delivery Address</label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <Input name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className="pl-9" placeholder="Enter market or buyer address" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!formData.cropName || !formData.weight || !formData.pickupAddress || !formData.deliveryAddress} className="bg-emerald-600 hover:bg-emerald-700">
                    Next Step
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600" /> Vehicle Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Preferred Vehicle</label>
                      <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full h-10 px-3 py-2 border rounded-md text-sm">
                        <option value="Mini Truck">Mini Truck (e.g., Tata Ace) - Up to 1 Ton</option>
                        <option value="3 Ton Truck">3 Ton Truck</option>
                        <option value="10 Ton Truck">10 Ton Truck</option>
                        <option value="Refrigerated">Refrigerated Truck (Cold Chain)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Pickup Date & Time</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="datetime-local" name="pickupTime" value={formData.pickupTime} onChange={handleChange} className="pl-9" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Vehicle capacity and availability will be checked upon requesting the booking. Estimated arrival will be provided by the driver.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handleEstimate} disabled={loading || !formData.pickupTime} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? "Calculating..." : "Calculate Freight Estimate"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold">Review & Confirm</h3>
                  <p className="text-muted-foreground">Please review your transport details and estimated cost.</p>
                </div>

                <div className="bg-slate-50 border rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Crop & Weight</p>
                      <p className="font-bold">{formData.cropName} • {formData.weight} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium">Vehicle</p>
                      <p className="font-bold">{formData.vehicleType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-bold mb-1">PICKUP</p>
                      <p className="text-sm">{formData.pickupAddress}</p>
                      <p className="text-xs text-emerald-600 mt-1">{new Date(formData.pickupTime).toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-slate-500 font-bold mb-1">DROP-OFF</p>
                      <p className="text-sm">{formData.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {estimation && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <h4 className="font-bold text-emerald-900 mb-4">Estimated Freight Breakdown</h4>
                    <div className="space-y-2 text-sm text-emerald-800">
                      <div className="flex justify-between">
                        <span>Base Fare (Distance)</span>
                        <span>₹{estimation.baseFare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weight Surcharge</span>
                        <span>₹{estimation.weightSurcharge}</span>
                      </div>
                      <div className="flex justify-between pt-2 mt-2 border-t border-emerald-200 font-bold text-lg">
                        <span>Total Estimated Cost</span>
                        <span>₹{estimation.totalFare}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 h-auto">
                    {loading ? "Confirming Booking..." : "Confirm & Search Drivers"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
