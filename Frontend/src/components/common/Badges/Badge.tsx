interface BadgeProps {
  text: string;
  className?: string;
}

function Badge({ text, className }: BadgeProps) {
  return <div className={`inline-block rounded-full px-2 py-0.5 font-bold text-xs ${className}`}>{text}</div>;
}

export default Badge;
