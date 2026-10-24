export function SkeletonBox({ className = "" }) {
  return <div className={`bg-slate-200 animate-pulse rounded ${className}`} />;
}

export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <SkeletonBox className="aspect-[16/10] rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBox className="h-5 w-2/3" />
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-6 w-1/4 mt-3" />
      </div>
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <SkeletonBox className="h-4 w-32" />
      <SkeletonBox className="h-9 w-1/2" />
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="aspect-[16/9] w-full" />
      <div className="space-y-3">
        <SkeletonBox className="h-6 w-1/4" />
        <SkeletonBox className="h-24 w-full" />
        <SkeletonBox className="h-24 w-full" />
      </div>
    </div>
  );
}