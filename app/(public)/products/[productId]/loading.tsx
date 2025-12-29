export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gray-200 h-64 md:h-80" />
      
      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="bg-gray-200 aspect-square rounded-lg" />
          
          {/* Details skeleton */}
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 w-3/4 rounded" />
            <div className="bg-gray-200 h-6 w-1/2 rounded" />
            <div className="bg-gray-200 h-4 w-full rounded" />
            <div className="bg-gray-200 h-4 w-full rounded" />
            <div className="bg-gray-200 h-4 w-2/3 rounded" />
            <div className="bg-gray-200 h-12 w-40 rounded-lg mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
