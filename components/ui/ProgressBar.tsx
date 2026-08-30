import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  className,
  value,
  max = 100,
  showLabel = false,
  ...props
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={clsx('w-full', className)} {...props}>
      <div className="h-2.5 w-full rounded-full bg-neutral-800 border border-neutral-700">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', {
            'bg-indigo-500': percent < 100,
            'bg-green-500': percent >= 100,
          })}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-neutral-400 text-right">{percent}%</p>
      )}
    </div>
  );
}
