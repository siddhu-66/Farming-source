'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Building2, Calendar, CheckCircle, ArrowLeft, RefreshCw, Landmark, Search, Upload, BookOpen, AlertCircle, FileText, ChevronRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SchemesPage() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState<string | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<{id: string, score: number, text: string} | null>(null);
  
  const router = useRouter();
  const { user } = useAuthStore();

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schemes');
      if (response.data.success) {
        setSchemes(response.data.data.schemes || []);
      } else {
        toast.error('Failed to load government schemes');
      }
    } catch (error) {
      toast.error('Error fetching schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleCheckEligibility = async (schemeId: string) => {
    setCheckingEligibility(schemeId);
    try {
      const { data } = await api.post('/schemes/eligibility', { schemeId });
      setEligibilityResult({
        id: schemeId,
        score: data.data.score,
        text: data.data.recommendation
      });
      toast.success('Eligibility checked successfully');
    } catch (error) {
      toast.error('Failed to verify eligibility. Try again later.');
    } finally {
      setCheckingEligibility(null);
    }
  };

  const activeApplications = [
    { id: '1', name: 'PM-KISAN Samman Nidhi', status: 'Approved', date: '2024-10-15', amount: '₹2,000 / term' },
    { id: '2', name: 'PMKSY - Irrigation Subsidy', status: 'Pending Documents', date: '2024-11-02', amount: '₹45,000' }
  ];

  const announcements = [
    { title: 'PMFBY Kharif 2024 deadline extended', date: 'Today, 09:00 AM', isNew: true },
    { title: 'New Organic Farming Subsidy announced', date: 'Yesterday', isNew: false }
  ];

  const getCards = (category: string) => {
    let filtered = category === 'all' ? schemes : schemes.filter(s => s.category?.toLowerCase() === category);
    if (searchQuery) {
      filtered = filtered.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      );
    }
    
    if (filtered.length === 0) {
      return (
        <div className="py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl mt-4 border border-dashed border-gray-300 dark:border-gray-700">
          <Search className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p>No schemes found matching your criteria.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filtered.map((scheme, i) => (
          <motion.div key={scheme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-all border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 flex flex-col flex-grow relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <Badge variant="secondary" className="uppercase text-[10px] bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {scheme.category || 'General'}
                  </Badge>
                  {scheme.deadline && (
                    <span className="flex items-center text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3 mr-1" /> {new Date(scheme.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white relative z-10">{scheme.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Building2 className="w-4 h-4 mr-2 text-primary" /> {scheme.ministry || 'State Government'}
                </div>
                
                <div className="space-y-3 flex-grow text-sm">
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{scheme.description}</p>
                </div>

                {eligibilityResult?.id === scheme.id && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">{eligibilityResult?.score}% Eligible</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{eligibilityResult?.text}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs" 
                    onClick={() => handleCheckEligibility(scheme.id)}
                    disabled={checkingEligibility === scheme.id}
                  >
                    {checkingEligibility === scheme.id ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1 text-primary" />} 
                    AI Check
                  </Button>
                  {(user?.role === 'FARMER' || user?.role === 'ADMIN') && (
                    <Button 
                      className="flex-1 text-xs bg-primary hover:bg-primary/90" 
                      onClick={() => {
                        toast.success('Opening Application Portal...');
                      }}
                    >
                      Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
              <Landmark className="mr-3 h-8 w-8 text-primary" /> Government Services
            </h1>
            <p className="text-gray-500 mt-1">Discover, apply for, and track government schemes and subsidies.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search schemes..." 
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={fetchSchemes}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex">
              <TabsTrigger value="all" className="flex-1">All Schemes</TabsTrigger>
              <TabsTrigger value="subsidy" className="flex-1">Subsidies</TabsTrigger>
              <TabsTrigger value="loan" className="flex-1">Loans</TabsTrigger>
              <TabsTrigger value="insurance" className="flex-1">Crop Insurance</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{getCards('all')}</TabsContent>
            <TabsContent value="subsidy">{getCards('subsidy')}</TabsContent>
            <TabsContent value="loan">{getCards('loan')}</TabsContent>
            <TabsContent value="insurance">{getCards('insurance')}</TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Active Applications */}
          {(user?.role === 'FARMER' || user?.role === 'ADMIN') && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Active Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {activeApplications.map((app) => (
                  <div key={app.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">{app.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={app.status === 'Approved' ? 'success' : 'warning'} className="text-[10px]">
                        {app.status}
                      </Badge>
                      <span className="text-xs font-semibold text-gray-600">{app.amount}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs h-8">View All Applications</Button>
              </CardContent>
            </Card>
          )}

          {/* Announcements */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-100 dark:border-orange-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-800 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ann.isNew ? 'bg-orange-500' : 'bg-orange-300'}`} />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">{ann.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ann.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider font-bold">Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md mr-3 group-hover:scale-110 transition-transform"><BookOpen className="w-4 h-4" /></div>
                <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">Document Center</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                <div className="p-1.5 bg-green-100 text-green-600 rounded-md mr-3 group-hover:scale-110 transition-transform"><Upload className="w-4 h-4" /></div>
                <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">Upload Aadhaar</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md mr-3 group-hover:scale-110 transition-transform"><MapPin className="w-4 h-4" /></div>
                <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">Nearby Soil Labs</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
