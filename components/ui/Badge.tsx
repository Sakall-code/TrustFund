import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-neutral-800 text-neutral-300 border border-neutral-700': variant === 'default',
          'bg-green-900/50 text-green-400 border border-green-800': variant === 'success',
          'bg-yellow-900/50 text-yellow-400 border border-yellow-800': variant === 'warning',
          'bg-red-900/50 text-red-400 border border-red-800': variant === 'danger',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
