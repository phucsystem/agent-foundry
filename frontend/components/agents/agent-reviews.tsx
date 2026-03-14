import type { Review, ReviewSummary } from "@/lib/types";
import { StarRating } from "@/components/ui/star-rating";

interface AgentReviewsProps {
  reviews: Review[];
  summary?: ReviewSummary;
}

export function AgentReviews({ reviews, summary }: AgentReviewsProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Reviews</h2>

      {summary && (
        <div className="flex items-center gap-6 p-5 bg-surface rounded-md mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.avgScore}</div>
            <StarRating rating={Math.round(summary.avgScore)} size="sm" />
            <div className="text-xs text-text-muted mt-0.5">Based on {summary.totalReviews} reviews</div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {summary.distribution.map((percent, index) => (
              <div key={5 - index} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="w-3 text-right">{5 - index}</span>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8">{percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
