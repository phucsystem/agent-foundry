"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentOutput, SocialVariant } from "@/lib/types/content";

interface ContentResultProps {
  output: ContentOutput;
}

function QualityBadge({ score }: { score: number }) {
  const color =
    score >= 0.8
      ? "bg-success/10 text-success"
      : score >= 0.6
        ? "bg-warning/10 text-warning"
        : "bg-error/10 text-error";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      Quality: {(score * 100).toFixed(0)}%
    </span>
  );
}

function SocialVariantTab({ variant }: { variant: SocialVariant }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(variant.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-lg bg-surface border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium capitalize text-text-primary">{variant.platform}</span>
        <span className="text-xs text-text-secondary">{variant.characterCount} chars</span>
      </div>
      <p className="text-sm text-text-secondary whitespace-pre-wrap mb-3">{variant.content}</p>
      {variant.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {variant.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="text-xs text-primary hover:text-primary/80 transition-colors"
      >
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}

export function ContentResult({ output }: ContentResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${output.slug || "content"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{output.title}</h2>
          <p className="text-sm text-text-secondary mt-1">{output.metaDescription}</p>
        </div>
        <QualityBadge score={output.qualityScore} />
      </div>

      <div className="flex flex-wrap gap-2">
        {output.keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="prose dark:prose-invert max-w-none p-6 rounded-lg bg-surface border border-border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.content}</ReactMarkdown>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface transition-colors"
        >
          {copied ? "Copied!" : "Copy Markdown"}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface transition-colors"
        >
          Download .md
        </button>
      </div>

      {output.socialVariants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Social Variants</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {output.socialVariants.map((variant) => (
              <SocialVariantTab key={variant.platform} variant={variant} />
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg bg-surface border border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-text-secondary">Cost</div>
            <div className="text-sm font-semibold text-text-primary">${output.costUsd.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary">Quality</div>
            <div className="text-sm font-semibold text-text-primary">{(output.qualityScore * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary">Status</div>
            <div className="text-sm font-semibold text-text-primary">
              {output.publishReady ? "Publish Ready" : "Needs Review"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
