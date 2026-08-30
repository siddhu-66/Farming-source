'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { DiseaseScanner } from '@/components/farmer/ai/DiseaseScanner';
import api from '@/lib/api';

interface ScanHistory {
  id: string;
  imageUrl: string;
  detectedCrop: string;
  healthStatus: string;
  diseases: Array<{
    name: string;
    confidence: number;
  }>;
  confidenceScore: number;
  createdAt: string;
}

export default function DiseasePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/ai/history', {
        params: {
          type: 'disease'
        }
      });
      if (res.data.success) {
        // Extract image reports from conversations if structured that way
        // Or fetch directly from ai_image_reports
        const imageRes = await api.get('/ai/image-reports');
        if (imageRes.data.success) {
          setHistory(imageRes.data.data.reports || []);
        }
      }
    } catch (err) {
      // Silently fail, show empty history
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getSeverityColor = (status: string) => {
    if (status === 'infected') return 'text-red-600 bg-red-100';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered crop disease identification and treatment recommendations
          </p>
        </div>
      </div>

      <DiseaseScanner />

      {/* Scan History */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
        </div>

        {loadingHistory ? (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="ml-2 text-gray-500">Loading history...</span>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Leaf className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No scan history yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your previous disease scans will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 6).map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        {scan.imageUrl && (
                          <img
                            src={scan.imageUrl}
                            alt={scan.detectedCrop}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Badge
                          className={`absolute top-2 right-2 ${getSeverityColor(scan.healthStatus)}`}
                        >
                          {scan.healthStatus}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {scan.detectedCrop}
                        </h3>
                        {scan.diseases && scan.diseases.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {scan.diseases[0].name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-green-600">
                          {scan.confidenceScore}% match
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
