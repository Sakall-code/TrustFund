'use client';

/**
 * ImageDropzone.tsx
 * A drag-and-drop + click-to-browse image picker that validates file type and size
 * immediately, shows a local preview once a valid file is chosen, and cleans up the
 * object URL on unmount to prevent memory leaks.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

interface ImageDropzoneProps {
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Return a human-readable size string (KB or MB) */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageDropzone({ file, onChange, error }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Create / revoke object URL when the file changes ─────────────────────
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  // ── Validate and accept a file ──────────────────────────────────────────
  const processFile = useCallback(
    (f: File) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setLocalError('Please choose a PNG, JPG, WEBP or GIF.');
        onChange(null);
        return;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setLocalError('Image must be under 5 MB.');
        onChange(null);
        return;
      }
      setLocalError(null);
      onChange(f);
    },
    [onChange]
  );

  // ── Drag handlers ───────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // required to allow drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  // ── Click / browse handler ──────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
    // Reset so the same file can be re-selected after removal
    e.target.value = '';
  };

  const handleRemove = () => {
    setLocalError(null);
    onChange(null);
  };

  // The error to display: local validation errors take priority, then parent error
  const displayError = localError ?? error;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
        Campaign Image
      </label>

      {file && previewUrl ? (
        /* ── Preview state ── */
        <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-4 flex items-center gap-4">
          <img
            src={previewUrl}
            alt="Campaign preview"
            className="h-24 w-24 rounded-lg object-cover flex-shrink-0 border border-neutral-600"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm text-neutral-100 truncate">{file.name}</p>
            <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="
              flex-shrink-0 rounded-lg border border-neutral-600 bg-neutral-700
              px-3 py-1.5 text-xs font-medium text-neutral-300
              hover:bg-red-600/20 hover:border-red-500 hover:text-red-400
              transition-colors focus:outline-none focus:ring-2 focus:ring-red-500
              focus:ring-offset-2 focus:ring-offset-neutral-900
            "
            aria-label="Remove image"
          >
            Remove
          </button>
        </div>
      ) : (
        /* ── Dropzone state ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            w-full rounded-xl border-2 border-dashed p-10
            flex flex-col items-center justify-center gap-2
            text-center cursor-pointer transition-colors
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:ring-offset-2 focus:ring-offset-neutral-900
            ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : displayError
                ? 'border-red-500 bg-neutral-800/40'
                : 'border-neutral-700 bg-neutral-800/40 hover:border-indigo-500/50'
            }
          `}
          aria-label="Upload campaign image"
        >
          <span className="text-4xl select-none" aria-hidden>🖼️</span>
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-indigo-400">Click to browse</span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-neutral-500">
            PNG, JPG, WEBP or GIF · max 5 MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {/* Error text */}
      {displayError && (
        <p className="text-sm text-red-400">{displayError}</p>
      )}
    </div>
  );
}
