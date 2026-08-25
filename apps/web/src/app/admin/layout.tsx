'use client';
import { UniversalDashboardLayout } from '@/components/dashboard/layout/UniversalDashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-admin">
      <UniversalDashboardLayout>
        {children}
      </UniversalDashboardLayout>
    </div>
  );
}
