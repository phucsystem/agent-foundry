"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import type { CostSegment, TimelineEntry } from "@/lib/types";

const TAB_ITEMS = ["Conversation", "Report", "Artifacts", "Cost Breakdown", "Timeline", "Reasoning Trace", "Tool Calls"];

interface TaskOutputProps {
  segments?: CostSegment[];
  timeline?: TimelineEntry[];
  agentName?: string;
  agentInitials?: string;
  agentColor?: string;
}

export function TaskOutput({ segments = [], timeline = [], agentName = "Coder", agentInitials = "C", agentColor = "#3B82F6" }: TaskOutputProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Task Output</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Download PDF</Button>
          <Button variant="secondary" size="sm">Download Markdown</Button>
          <Button variant="secondary" size="sm">Download JSON</Button>
        </div>
      </div>

      <Tabs items={TAB_ITEMS} activeIndex={activeTab} onTabChange={setActiveTab} />

      <div className="bg-white dark:bg-slate-800 border border-border rounded-md p-6">
        {activeTab === 0 && <ConversationTab agentName={agentName} agentInitials={agentInitials} agentColor={agentColor} />}
        {activeTab === 1 && <ReportTab />}
        {activeTab === 2 && <ArtifactsTab />}
        {activeTab === 3 && <CostBreakdownTab segments={segments} />}
        {activeTab === 4 && <TimelineTab entries={timeline} />}
        {activeTab === 5 && <p className="text-sm text-text-secondary">Reasoning trace would appear here...</p>}
        {activeTab === 6 && <p className="text-sm text-text-secondary">Tool call details would appear here...</p>}
      </div>
    </section>
  );
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "agent",
    text: "Task completed. 12 unit tests generated, all passing. PR #47 created on GitHub. Let me know if you need adjustments.",
    time: "10:31 AM",
  },
  {
    id: "msg-2",
    sender: "user",
    text: "Can you also add a test for concurrent login attempts? I want to verify session conflict handling.",
    time: "10:33 AM",
  },
  {
    id: "msg-3",
    sender: "agent",
    text: "Done. Added 2 concurrent session tests to PR #47. Both pass. Total: 14 tests. Follow-up cost: $0.80.",
    time: "10:34 AM",
  },
  {
    id: "msg-4",
    sender: "user",
    text: "Perfect, that covers everything. Approved.",
    time: "10:35 AM",
  },
];

function ConversationTab({ agentName, agentInitials, agentColor }: { agentName: string; agentInitials: string; agentColor: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const agentReply: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: "agent",
        text: "Got it. I'll look into that and get back to you shortly.",
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 1500);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div ref={chatContainerRef} className="flex flex-col gap-3 max-h-[500px] overflow-y-auto mb-4 pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 max-w-[85%] ${message.sender === "user" ? "self-end flex-row-reverse" : ""}`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: message.sender === "agent" ? agentColor : "var(--color-neutral)" }}
            >
              {message.sender === "agent" ? agentInitials : "U"}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[10px] font-semibold text-text-muted ${message.sender === "user" ? "text-right" : ""}`}>
                {message.sender === "agent" ? agentName : "You"}
              </span>
              <div
                className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  message.sender === "agent"
                    ? "bg-surface dark:bg-slate-700 border border-border rounded-tl-sm"
                    : "bg-primary text-white rounded-tr-sm"
                }`}
              >
                {message.text}
              </div>
              <span className={`text-[10px] text-text-muted ${message.sender === "user" ? "text-right" : ""}`}>
                {message.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: agentColor }}
            >
              {agentInitials}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-text-muted">{agentName}</span>
              <div className="bg-surface dark:bg-slate-700 border border-border rounded-lg rounded-tl-sm px-3 py-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[typing-bounce_1.2s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[typing-bounce_1.2s_ease-in-out_infinite_0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[typing-bounce_1.2s_ease-in-out_infinite_0.3s]" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Compose bar */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-900 dark:text-white resize-none min-h-[44px] max-h-[120px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Ask the agent to clarify or adjust..."
          rows={1}
        />
        <button
          onClick={handleSend}
          className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary text-white shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Send message"
        >
          <Icon icon="lucide:send" width={18} height={18} />
        </button>
      </div>
    </div>
  );
}

function ReportTab() {
  return (
    <>
      <h3 className="text-base font-semibold mb-4">Unit Test Report: Authentication Module</h3>
      <p className="text-sm text-text-secondary mb-4">
        Generated 12 unit tests covering the authentication login flow, including edge cases for token expiry, invalid credentials, and rate limiting.
      </p>
      <h4 className="text-sm font-semibold mb-2">Test Summary</h4>
      <div className="overflow-x-auto border border-border rounded-md mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-surface dark:bg-slate-800 border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Test</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-right py-3 px-4 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {TEST_ROWS.map((row) => (
              <tr key={row.name} className="border-b border-border hover:bg-surface dark:hover:bg-slate-800">
                <td className="py-3 px-4">{row.name}</td>
                <td className="py-3 px-4"><Badge variant="success">Pass</Badge></td>
                <td className="py-3 px-4 text-right">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ArtifactsTab() {
  return (
    <>
      <h3 className="text-base font-semibold mb-4">Artifacts</h3>
      <div className="flex flex-col gap-3">
        {MOCK_ARTIFACTS.map((artifact) => (
          <div key={artifact.name} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-surface dark:hover:bg-slate-700/30 transition-colors">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${artifact.bgClass}`}>
              <Icon icon={artifact.icon} width={18} height={18} className={artifact.iconClass} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{artifact.name}</div>
              <div className="text-xs text-text-muted">{artifact.description}</div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{artifact.type}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const MOCK_ARTIFACTS = [
  {
    name: "tests/test_auth_login.py",
    description: "12 test cases, 6 functions — PR #47",
    type: "Code",
    icon: "lucide:file-code-2",
    bgClass: "bg-primary/10",
    iconClass: "text-primary",
  },
  {
    name: "Test Coverage Report",
    description: "94% coverage for auth/login.py",
    type: "PDF",
    icon: "lucide:file-text",
    bgClass: "bg-error/10",
    iconClass: "text-error",
  },
  {
    name: "github.com/repo/pull/47",
    description: "Pull request with all changes",
    type: "URL",
    icon: "lucide:external-link",
    bgClass: "bg-success/10",
    iconClass: "text-success",
  },
];

function TimelineTab({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-secondary">No timeline data available.</p>;
  }

  return (
    <>
      <h3 className="text-base font-semibold mb-4">Execution Timeline</h3>
      <div className="timeline-line">
        {entries.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="relative pb-4 last:pb-0">
            <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full z-10 ${entry.dotColor}`} />
            <div className="flex justify-between items-center">
              <strong className="text-sm">{entry.label}</strong>
              <span className="text-xs text-text-muted">{entry.timestamp}</span>
            </div>
            <p className="text-xs text-text-muted">{entry.detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const TEST_ROWS = [
  { name: "test_login_valid_credentials", duration: "0.12s" },
  { name: "test_login_invalid_password", duration: "0.08s" },
  { name: "test_login_nonexistent_user", duration: "0.09s" },
  { name: "test_login_expired_token_refresh", duration: "0.15s" },
  { name: "test_login_rate_limit_exceeded", duration: "0.22s" },
  { name: "test_login_sql_injection_prevention", duration: "0.11s" },
];

function CostBreakdownTab({ segments }: { segments: CostSegment[] }) {
  if (segments.length === 0) {
    return <p className="text-sm text-text-secondary">No cost data available.</p>;
  }

  return (
    <>
      <h3 className="text-base font-semibold mb-4">Cost Breakdown</h3>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`h-full rounded-full ${segment.color}`}
            style={{ width: `${segment.percentage}%` }}
          />
        ))}
      </div>
      <div className="flex gap-6 text-sm flex-wrap">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${segment.color}`} />
            {segment.label} <strong>${segment.amount.toFixed(2)}</strong> ({segment.percentage}%)
          </div>
        ))}
      </div>
    </>
  );
}

