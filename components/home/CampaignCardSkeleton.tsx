export default function CampaignCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 animate-pulse"
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className="aspect-video w-full bg-neutral-800" />

      {/* Body content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tags placeholder */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-neutral-800" />
          <div className="h-5 w-20 rounded-full bg-neutral-800" />
        </div>

        {/* Title placeholder (2 lines) */}
        <div className="mb-4 space-y-2">
          <div className="h-5 w-4/5 rounded bg-neutral-800" />
          <div className="h-5 w-3/5 rounded bg-neutral-800" />
        </div>

        {/* Progress bar placeholder */}
        <div className="mb-3">
          <div className="h-2.5 w-full rounded-full bg-neutral-800" />
        </div>

        {/* Funding & Deadline stats */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-neutral-800" />
          <div className="h-4 w-16 rounded bg-neutral-800" />
        </div>

        {/* Footer creator placeholder */}
        <div className="mt-auto border-t border-neutral-800/80 pt-4">
          <div className="h-4 w-32 rounded bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
