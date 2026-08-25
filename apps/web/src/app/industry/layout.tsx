'use client';
import { UniversalDashboardLayout } from '@/components/dashboard/layout/UniversalDashboardLayout';

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-industry">
      <UniversalDashboardLayout>
        {children}
      </UniversalDashboardLayout>
    </div>
  );
}
