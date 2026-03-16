"use client";

import Link from "next/link";
import { ContentTaskForm } from "@/components/content/content-task-form";

export default function NewContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/content"
          className="text-sm text-text-secondary hover:text-primary transition-colors no-underline"
        >
          &larr; Back to Content
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Create Content</h1>
        <p className="text-sm text-text-secondary mt-1">
          Describe your topic and our AI crew will research, write, edit, and repurpose it.
        </p>
      </div>

      <ContentTaskForm />
    </div>
  );
}
