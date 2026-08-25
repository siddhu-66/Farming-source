'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Landmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function GovernmentAlertsWidget() {
  const alerts = [
    { title: 'PM-Kisan Installment', desc: '14th installment released.', link: '/farmer/schemes' },
    { title: 'Crop Insurance', desc: 'Deadline for Kharif crops approaching.', link: '/farmer/schemes' },
    { title: 'Solar Pump Subsidy', desc: 'Apply for 60% subsidy.', link: '/farmer/schemes' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-indigo-700"><Landmark className="w-5 h-5 mr-2"/> Government Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <Link key={i} href={alert.link} className="block p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">{alert.title}</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">{alert.desc}</p>
            </Link>
          ))}
          <Link href="/farmer/schemes" className="flex items-center justify-center text-sm text-primary hover:underline pt-2">
            View All Schemes <ArrowRight className="w-4 h-4 ml-1"/>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
