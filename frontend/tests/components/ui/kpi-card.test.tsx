import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "@/components/ui/kpi-card";

describe("KpiCard", () => {
  it("renders label, value, and change", () => {
    render(
      <KpiCard
        label="Revenue"
        value="$1,234"
        change="+12%"
        changeType="positive"
      />
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,234")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("applies positive change styling", () => {
    render(
      <KpiCard
        label="Growth"
        value="5%"
        change="+2%"
        changeType="positive"
      />
    );
    expect(screen.getByText("+2%").className).toContain("text-success");
  });

  it("applies negative change styling", () => {
    render(
      <KpiCard
        label="Churn"
        value="3%"
        change="-1%"
        changeType="negative"
      />
    );
    expect(screen.getByText("-1%").className).toContain("text-error");
  });
});
