"use client";

import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/utils";
import type { KnowledgeFile } from "@/lib/types";

interface KnowledgeSummaryProps {
  customInstructions: string;
  knowledgeFiles: KnowledgeFile[];
  tools: string[];
  llm: string;
  onEdit: () => void;
}

export function KnowledgeSummary({ customInstructions, knowledgeFiles, tools, llm, onEdit }: KnowledgeSummaryProps) {
  return (
    <div className="bg-white dark:bg-[#020617] border border-border rounded-lg p-6">
      <div className="flex items-center justify-between text-sm font-semibold mb-4">
        Knowledge &amp; Configuration
        <button onClick={onEdit} className="text-xs text-primary font-medium hover:underline">
          Edit
        </button>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Custom Instructions
        </div>
        {customInstructions ? (
          <div className="font-mono text-sm text-text-secondary bg-surface rounded-lg p-3 leading-relaxed max-h-[120px] overflow-hidden whitespace-pre-wrap">
            {customInstructions}
          </div>
        ) : (
          <div className="text-sm text-text-muted italic bg-surface rounded-lg p-3">
            No custom instructions set
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Knowledge Files
        </div>
        {knowledgeFiles.length === 0 ? (
          <div className="text-sm text-text-muted italic">No files uploaded</div>
        ) : (
          knowledgeFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 py-2 text-sm border-b border-border last:border-b-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-text-muted shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="flex-1">{file.name}</span>
              <span className="text-xs text-text-muted">{formatFileSize(file.sizeBytes)}</span>
            </div>
          ))
        )}
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Tools</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {tools.length > 0 ? (
            tools.map((tool) => <Badge key={tool} variant="info">{tool}</Badge>)
          ) : (
            <span className="text-sm text-text-muted italic">No tools configured</span>
          )}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">LLM Backend</div>
        <span className="text-sm">{llm}</span>
      </div>
    </div>
  );
}
