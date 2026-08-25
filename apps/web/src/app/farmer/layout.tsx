'use client';
import { UniversalDashboardLayout } from '@/components/dashboard/layout/UniversalDashboardLayout';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalDashboardLayout>
      {children}
    </UniversalDashboardLayout>
  );
}
