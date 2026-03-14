"use client";

import { useEffect, useRef, useState } from "react";
import {
  useHiredAgentDetail,
  useUpdateSettings,
  useUploadKnowledge,
  useDeleteKnowledge,
} from "@/lib/hooks/use-hired-agents";
import { formatFileSize } from "@/lib/utils";

interface AgentSettingsModalProps {
  hireId: string;
  agentName: string;
  agentColor: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentSettingsModal({ hireId, agentName, agentColor, isOpen, onClose }: AgentSettingsModalProps) {
  const { data: detail } = useHiredAgentDetail(hireId);
  const updateSettings = useUpdateSettings();
  const uploadKnowledge = useUploadKnowledge();
  const deleteKnowledge = useDeleteKnowledge();

  const [instructions, setInstructions] = useState("");
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (detail?.settings.customInstructions) {
      setInstructions(detail.settings.customInstructions);
    }
  }, [detail?.settings.customInstructions]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings.mutate(
      { hireId, customInstructions: instructions },
      { onSuccess: () => onClose() },
    );
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.name.endsWith(".md") && file.size <= 5_242_880) {
        uploadKnowledge.mutate({ hireId, file });
      }
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragover(false);
    const mdFiles = Array.from(event.dataTransfer.files).filter((file) =>
      /\.(md|markdown)$/i.test(file.name)
    );
    if (mdFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      mdFiles.forEach((file) => dataTransfer.items.add(file));
      handleFileUpload(dataTransfer.files);
    }
  };

  const knowledgeFiles = detail?.settings.knowledgeFiles ?? [];
  const initial = agentName.charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#020617] border border-border rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: agentColor }}
            >
              {initial}
            </div>
            <span className="text-base font-semibold">{agentName} Settings</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Custom Instructions</label>
            <p className="text-xs text-text-muted leading-relaxed">
              Prepended to every task. Define tone, constraints, focus areas.
            </p>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="e.g. Always use Python type hints. Follow our code standards."
              className="w-full min-h-[120px] p-3 border border-border rounded-lg bg-surface text-sm font-mono leading-relaxed resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-text-muted"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Knowledge Files</label>
            <p className="text-xs text-text-muted leading-relaxed">
              Upload .md files as initial memory.
            </p>
            <div
              className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-colors ${dragover ? "border-primary bg-primary/5" : "border-border hover:border-primary"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
            >
              <div className="text-sm text-text-secondary">
                <strong className="text-primary">Click to upload</strong> or drag and drop
              </div>
              <div className="text-xs text-text-muted mt-1">Markdown (.md) up to 5 MB each</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown"
                multiple
                className="hidden"
                onChange={(event) => { handleFileUpload(event.target.files); event.target.value = ""; }}
              />
            </div>

            {knowledgeFiles.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {knowledgeFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-text-muted shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-text-muted shrink-0">{formatFileSize(file.sizeBytes)}</span>
                    <button
                      onClick={() => deleteKnowledge.mutate({ hireId, fileId: file.id })}
                      className="text-text-muted hover:text-error p-0.5 shrink-0 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
