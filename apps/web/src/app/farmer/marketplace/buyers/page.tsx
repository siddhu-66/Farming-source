"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Star, CheckCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function BuyerDiscovery() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState(false);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (searchQuery) params.cropName = searchQuery;
      if (filterVerified) params.verified = true;

      const res = await api.get('/api/marketplace/buyers', { params });
      if (res.data?.success) {
        setBuyers(res.data.data.buyers || []);
      }
    } catch (err) {
      toast.error("Failed to load buyers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBuyers();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filterVerified]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Buyer Discovery</h1>
          <p className="text-muted-foreground">Find wholesale buyers, industries, and retailers near you.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search by crop (e.g. Wheat, Tomato)"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 border p-2 rounded-lg bg-slate-50">
            <input 
              type="checkbox" 
              id="verifiedOnly" 
              checked={filterVerified} 
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
            />
            <label htmlFor="verifiedOnly" className="text-sm font-medium whitespace-nowrap cursor-pointer">
              Verified Only
            </label>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-md mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No buyers found</h3>
          <p className="text-muted-foreground mt-2">Try searching for a different crop or adjusting filters.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {buyers.map((buyer, idx) => {
            const profile = buyer.buyerProfile?.[0] || {};
            return (
              <motion.div
                key={buyer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-emerald-200 transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden">
                          {buyer.avatar ? (
                            <img src={buyer.avatar} alt={buyer.name} className="w-full h-full object-cover" />
                          ) : (
                            buyer.name?.substring(0, 2).toUpperCase() || "BU"
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                            {buyer.name}
                            {buyer.isVerified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building className="w-3 h-3" />
                            {profile.businessType || 'Retailer'}
                          </div>
                        </div>
                      </div>
                      {profile.rating > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-medium">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {profile.rating}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      {buyer.address && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{buyer.address?.district || 'Location'}, {buyer.address?.state || 'Unknown'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {profile.preferredCrops && profile.preferredCrops.length > 0 ? (
                            profile.preferredCrops.map((crop: string, i: number) => (
                              <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                                {crop}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Any crop</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-6 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200">
                      View Profile & Send Offer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
