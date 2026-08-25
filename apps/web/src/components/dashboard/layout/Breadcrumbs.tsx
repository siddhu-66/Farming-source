"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname) return null;
  
  const paths = pathname.split('/').filter(p => p);
  
  // Format the breadcrumb names safely
  const formatName = (str: string) => {
    // If it's a dynamic ID (like a mongodb ObjectId or UUID), we abbreviate it
    if (str.length > 20 || str.match(/^[0-9a-fA-F]{24}$/)) {
      return `...${str.substring(str.length - 4)}`;
    }
    // Capitalize and replace hyphens
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 max-w-full overflow-hidden whitespace-nowrap">
      {/* We always show "Dashboard" as the root if the first path is a role (e.g. /farmer) */}
      {paths.length > 0 && (
        <div className="flex items-center shrink-0">
          <Link href={`/${paths[0]}/dashboard`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
            Dashboard
          </Link>
        </div>
      )}

      {/* Render the rest of the paths (skipping the role path and the word 'dashboard' itself if it is the second path) */}
      {paths.slice(1).map((path, index) => {
        if (path.toLowerCase() === 'dashboard') return null; // Already covered by root

        const href = `/${paths.slice(0, index + 2).join('/')}`;
        const isLast = index === paths.length - 2;
        const name = formatName(path);
        
        return (
          <div key={`${path}-${index}`} className="flex items-center shrink-0">
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-[200px]" title={name}>
                {name}
              </span>
            ) : (
              <Link href={href} className="hover:text-green-600 dark:hover:text-green-400 transition-colors truncate max-w-[100px] sm:max-w-[150px]" title={name}>
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
