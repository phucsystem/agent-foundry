type AvatarSize = "sm" | "default" | "lg" | "xl";

interface AvatarProps {
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-sm",
  default: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

export function Avatar({
  initials,
  gradientFrom,
  gradientTo,
  size = "default",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {initials}
    </div>
  );
}
