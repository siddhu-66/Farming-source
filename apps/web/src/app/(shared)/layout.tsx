'use client';
import { UniversalDashboardLayout } from '@/components/dashboard/layout/UniversalDashboardLayout';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalDashboardLayout>
      {children}
    </UniversalDashboardLayout>
  );
}
