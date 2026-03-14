"use client";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: "text-xs",
  default: "text-lg",
  lg: "text-3xl",
};

export function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onRate,
  size = "default",
  className = "",
}: StarRatingProps) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= rating;

        return (
          <span
            key={starIndex}
            className={`${SIZE_MAP[size]} ${
              isFilled ? "text-warning" : "text-slate-200 dark:text-slate-600"
            } ${interactive ? "cursor-pointer hover:text-warning transition-colors" : ""}`}
            onClick={interactive && onRate ? () => onRate(starIndex) : undefined}
            onKeyDown={interactive && onRate ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRate(starIndex);
              }
            } : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Rate ${starIndex} stars` : undefined}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
}
