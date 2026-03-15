import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies hover shadow by default", () => {
    const { container } = render(<Card>Hover card</Card>);
    expect(container.firstElementChild?.className).toContain("hover:shadow-card");
  });

  it("disables hover when hoverable is false", () => {
    const { container } = render(<Card hoverable={false}>Static card</Card>);
    expect(container.firstElementChild?.className).not.toContain("hover:shadow-card");
  });

  it("merges custom className", () => {
    const { container } = render(<Card className="my-class">Test</Card>);
    expect(container.firstElementChild?.className).toContain("my-class");
  });
});
