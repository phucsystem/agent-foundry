"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateContentTask } from "@/lib/hooks/use-content-tasks";
import { useCreditBalance } from "@/lib/hooks/use-credits";

const CONTENT_TYPES = [
  { value: "blog" as const, label: "Blog Post", cost: 50 },
  { value: "email" as const, label: "Email Campaign", cost: 30 },
  { value: "social" as const, label: "Social Media", cost: 20 },
];

export function ContentTaskForm() {
  const router = useRouter();
  const createTask = useCreateContentTask();
  const { data: balance } = useCreditBalance();

  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<"blog" | "email" | "social">("blog");
  const [wordCount, setWordCount] = useState(2000);
  const [keywords, setKeywords] = useState("");

  const selectedType = CONTENT_TYPES.find((type) => type.value === contentType);
  const costCents = selectedType?.cost ?? 50;
  const hasEnoughCredits = (balance?.creditBalanceCents ?? 0) >= costCents;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;

    const keywordList = keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    createTask.mutate(
      {
        topic: topic.trim(),
        contentType,
        brandConfigId: "00000000-0000-0000-0000-000000000002",
        targetWordCount: wordCount,
        keywords: keywordList,
        competitorUrls: [],
      },
      {
        onSuccess: (data) => {
          router.push(`/tasks/${data.taskId}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-text-primary mb-1.5">
          Topic *
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g., 10 Productivity Tips for Remote Teams"
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength={3}
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Content Type</label>
        <div className="grid grid-cols-3 gap-3">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setContentType(type.value)}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                contentType === type.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-text-secondary hover:border-primary/50"
              }`}
            >
              <div>{type.label}</div>
              <div className="text-xs mt-1 opacity-70">${(type.cost / 100).toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="wordCount" className="block text-sm font-medium text-text-primary mb-1.5">
          Target Word Count: {wordCount.toLocaleString()}
        </label>
        <input
          id="wordCount"
          type="range"
          min={200}
          max={5000}
          step={100}
          value={wordCount}
          onChange={(event) => setWordCount(Number(event.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-secondary">
          <span>200</span>
          <span>5,000</span>
        </div>
      </div>

      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-text-primary mb-1.5">
          Keywords (comma-separated)
        </label>
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          placeholder="e.g., remote work, productivity, time management"
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
        <div>
          <span className="text-sm text-text-secondary">Cost: </span>
          <span className="text-lg font-semibold text-text-primary">
            ${(costCents / 100).toFixed(2)}
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          Balance: ${((balance?.creditBalanceCents ?? 0) / 100).toFixed(2)}
        </div>
      </div>

      {!hasEnoughCredits && (
        <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
          Insufficient credits. Please top up to continue.
        </div>
      )}

      <button
        type="submit"
        disabled={!topic.trim() || !hasEnoughCredits || createTask.isPending}
        className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {createTask.isPending ? "Generating..." : "Generate Content"}
      </button>

      {createTask.isError && (
        <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
          {createTask.error.message}
        </div>
      )}
    </form>
  );
}
