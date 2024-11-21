interface BadgeSkeletonSizeProps {
  topBadgeWidth?: string;
  topBadgeHeight?: string;
  bottomBadgeWidth?: string;
  bottomBadgeHeight?: string;
}

function ThumbnailSkeleton({
  topBadgeWidth = 'w-12',
  topBadgeHeight = 'h-6',
  bottomBadgeWidth = 'w-12',
  bottomBadgeHeight = 'h-6',
}: BadgeSkeletonSizeProps = {}) {
  return (
    <div className="absolute inset-0 animate-pulse bg-lico-gray-4">
      <div className={`absolute left-2 top-2 rounded-full bg-lico-gray-3 ${topBadgeWidth} ${topBadgeHeight}`} />
      <div
        className={`absolute bottom-2 left-2 rounded-full bg-lico-gray-3 ${bottomBadgeWidth} ${bottomBadgeHeight}`}
      />
    </div>
  );
}

export default ThumbnailSkeleton;
