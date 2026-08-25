'use client';
import { UniversalDashboardLayout } from '@/components/dashboard/layout/UniversalDashboardLayout';

export default function TransportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-orange">
      <UniversalDashboardLayout>
        {children}
      </UniversalDashboardLayout>
    </div>
  );
}
