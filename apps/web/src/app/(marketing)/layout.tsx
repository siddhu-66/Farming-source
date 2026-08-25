import { Navbar } from '@/components/shared/Navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 text-gray-500">
          <p>&copy; {new Date().getFullYear()} AgriAssist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
