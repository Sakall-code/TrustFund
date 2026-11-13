import Link from 'next/link';
import { Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No campaigns found',
  description = 'Be the first to launch an innovative project and receive community funding on Polygon.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-800/80 text-indigo-400">
        <Rocket className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-neutral-400">{description}</p>
      <Link href="/create">
        <Button variant="primary" size="md">
          Start a campaign
        </Button>
      </Link>
    </div>
  );
}
