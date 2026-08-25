import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbNavProps {
  items: { label: string; href?: string }[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center hover:text-primary">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link href={item.href} className="ml-1 hover:text-primary md:ml-2">
                  {item.label}
                </Link>
              ) : (
                <span className="ml-1 text-gray-900 md:ml-2 dark:text-gray-100">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
