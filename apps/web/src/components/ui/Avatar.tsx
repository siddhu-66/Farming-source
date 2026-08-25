import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ className, fallback, size = 'md', ...props }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800', sizes[size], className)}>
      {props.src ? (
        <img className="h-full w-full object-cover" {...props} alt={props.alt || 'Avatar'} />
      ) : (
        <span className="font-medium text-gray-600 dark:text-gray-300">{fallback || 'U'}</span>
      )}
    </div>
  );
}
