'use client';

import { type HTMLAttributes, useEffect, useCallback } from 'react';
import clsx from 'clsx';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function Modal({ className, isOpen, onClose, title, children, ...props }: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={clsx(
          'relative z-10 w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl',
          className
        )}
        {...props}
      >
        {title && <h2 className="text-lg font-semibold text-neutral-100 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
