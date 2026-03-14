"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TaskRating() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Rate this result</h2>
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-800 border border-border rounded-md">
        <StarRating
          rating={rating}
          interactive
          onRate={setRating}
          size="lg"
        />
        <Textarea
          id="review-comment"
          label="Comment (optional)"
          placeholder="Share your experience with this agent..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="!min-h-[80px]"
        />
        <div className="flex gap-2">
          <Button variant="primary">Submit Review</Button>
          <Button variant="secondary">Skip</Button>
        </div>
      </div>
    </section>
  );
}
