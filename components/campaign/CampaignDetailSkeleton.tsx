export default function CampaignDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="w-full h-64 md:h-96 bg-gray-800 rounded-xl"></div>
            <div className="h-10 bg-gray-800 rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-800 rounded w-16"></div>
              <div className="h-6 bg-gray-800 rounded w-20"></div>
            </div>
            <div className="h-12 bg-gray-800 rounded-full w-48 mt-4"></div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-8">
          <div className="h-64 bg-gray-800 rounded-xl"></div>
          <div className="h-32 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
