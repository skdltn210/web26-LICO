interface BadgeProps {
  text: string;
  className?: string;
}

function Badge({ text, className }: BadgeProps) {
  return <div className={`flex items-center justify-center rounded-full px-2 py-0.5 ${className}`}>{text}</div>;
}

export default Badge;
