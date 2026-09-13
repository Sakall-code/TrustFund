'use client';

/**
 * DeadlinePicker.tsx
 * A date-picker that shows a native <input type="date">, three quick-pick buttons
 * (7 / 30 / 60 days), and a live "Ends on …" preview line so beginners can see
 * exactly when their campaign will close.
 */

import { useMemo } from 'react';
import { format, addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';

interface DeadlinePickerProps {
  /** ISO date string (YYYY-MM-DD) or empty string */
  value: string;
  onChange: (v: string) => void;
}

/** Format a JS Date as the YYYY-MM-DD string that <input type="date"> needs */
function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const today = useMemo(() => new Date(), []);

  const minDate = toInputValue(addDays(today, 1));   // tomorrow
  const maxDate = toInputValue(addDays(today, 90));  // 90 days from today

  /** Derive the preview text whenever `value` changes */
  const preview = useMemo(() => {
    if (!value) return null;
    try {
      const picked = parseISO(value);
      const days = differenceInCalendarDays(picked, today);
      if (days < 0) return null;
      return `Ends on ${format(picked, 'd MMMM yyyy')} (${days} day${days === 1 ? '' : 's'} from now)`;
    } catch {
      return null;
    }
  }, [value, today]);

  const setQuick = (daysFromNow: number) => {
    onChange(toInputValue(addDays(today, daysFromNow)));
  };

  return (
    <div className="w-full space-y-3">
      {/* Native date input */}
      <input
        type="date"
        id="deadline"
        value={value}
        min={minDate}
        max={maxDate}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl border border-neutral-700 bg-neutral-800
          px-4 py-2.5 text-sm text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          focus:ring-offset-2 focus:ring-offset-neutral-900
          [color-scheme:dark]
        "
        aria-label="Campaign deadline"
      />

      {/* Quick-pick buttons */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Quick deadline presets">
        {([7, 30, 60] as const).map((days) => {
          const qv = toInputValue(addDays(today, days));
          const active = value === qv;
          return (
            <Button
              key={days}
              type="button"
              size="sm"
              variant={active ? 'primary' : 'secondary'}
              onClick={() => setQuick(days)}
              aria-pressed={active}
            >
              {days} days
            </Button>
          );
        })}
      </div>

      {/* Live preview */}
      {preview && (
        <p className="text-sm text-indigo-400 font-medium" aria-live="polite">
          📅 {preview}
        </p>
      )}
    </div>
  );
}
