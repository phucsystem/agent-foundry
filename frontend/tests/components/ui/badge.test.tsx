import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies success variant styling", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK").className).toContain("text-success");
  });

  it("applies error variant styling", () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText("Error").className).toContain("text-error");
  });

  it("applies warning variant styling", () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning").className).toContain("text-warning");
  });

  it("applies info variant styling", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info").className).toContain("text-primary");
  });

  it("applies neutral variant styling", () => {
    render(<Badge variant="neutral">Neutral</Badge>);
    expect(screen.getByText("Neutral").className).toContain("text-neutral");
  });

  it("merges custom className", () => {
    render(
      <Badge variant="success" className="extra">
        Test
      </Badge>
    );
    expect(screen.getByText("Test").className).toContain("extra");
  });
});
