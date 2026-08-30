'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Calendar, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ReportBuilder() {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.post('/reports/generate', {
        reportType,
        format,
        dateRange: { start: '2024-01-01', end: '2024-12-31' }
      });
      if (res.data.success) {
        toast.success(`Report generated! Click to download.`);
      }
    } catch (e) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Report Type</label>
            <select 
              className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="summary">Executive Summary</option>
              <option value="financial">Financial Performance</option>
              <option value="operational">Operational KPIs</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Format</label>
            <select 
              className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 text-sm"><Calendar className="w-4 h-4 mr-2" /> Date Range</Button>
          <Button variant="outline" className="flex-1 text-sm"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button className="flex-1 text-sm" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button variant="outline" className="px-3" title="Download Template"><Download className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
