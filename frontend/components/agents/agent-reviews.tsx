import type { Review } from "@/lib/types";
import { StarRating } from "@/components/ui/star-rating";

interface AgentReviewsProps {
  reviews: Review[];
}

export function AgentReviews({ reviews }: AgentReviewsProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Reviews</h2>
      <div className="bg-white dark:bg-slate-800 border border-border rounded-md divide-y divide-border">
        {reviews.map((review) => (
          <div key={review.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{review.author}</span>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <span className="text-xs text-text-muted">{review.date}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
