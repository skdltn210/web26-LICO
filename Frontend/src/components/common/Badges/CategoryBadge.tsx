interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <div className="rounded-full bg-lico-orange-2 px-2.5 pb-[1px] pt-[3px] font-bold text-sm text-lico-gray-5 transition-colors hover:bg-lico-orange-1">
      {category}
    </div>
  );
}
