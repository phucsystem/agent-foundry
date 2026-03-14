"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TAB_ITEMS = ["Report", "Code", "Reasoning Trace", "Tool Calls"];

export function TaskOutput() {
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
        {activeTab === 0 && <ReportTab />}
        {activeTab === 1 && <CodeTab />}
        {activeTab === 2 && <p className="text-sm text-text-secondary">Reasoning trace would appear here...</p>}
        {activeTab === 3 && <p className="text-sm text-text-secondary">Tool call details would appear here...</p>}
      </div>
    </section>
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

function CodeTab() {
  return (
    <pre>
      <code>{SAMPLE_CODE}</code>
    </pre>
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

const SAMPLE_CODE = `import pytest
from unittest.mock import patch, MagicMock
from auth.login import authenticate_user

class TestLoginFlow:
    def test_login_valid_credentials(self, db_session):
        """Valid email/password returns access + refresh tokens."""
        result = authenticate_user(
            email="user@example.com",
            password="correct-password",
            session=db_session
        )
        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.expires_in == 3600

    def test_login_invalid_password(self, db_session):
        """Wrong password raises AuthenticationError."""
        with pytest.raises(AuthenticationError):
            authenticate_user(
                email="user@example.com",
                password="wrong-password",
                session=db_session
            )`;
