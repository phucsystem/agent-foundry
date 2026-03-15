import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders initials", () => {
    render(<Avatar initials="CA" gradientFrom="#3B82F6" gradientTo="#2563EB" />);
    expect(screen.getByText("CA")).toBeInTheDocument();
  });

  it("applies gradient background via inline style", () => {
    const { container } = render(
      <Avatar initials="AB" gradientFrom="#10B981" gradientTo="#059669" />
    );
    const element = container.firstElementChild as HTMLElement;
    expect(element.style.background).toContain("linear-gradient");
    expect(element.style.background).toContain("rgb(16, 185, 129)");
  });

  it("applies default size", () => {
    const { container } = render(
      <Avatar initials="AB" gradientFrom="#fff" gradientTo="#000" />
    );
    expect(container.firstElementChild?.className).toContain("w-12");
  });

  it("applies small size", () => {
    const { container } = render(
      <Avatar initials="AB" gradientFrom="#fff" gradientTo="#000" size="sm" />
    );
    expect(container.firstElementChild?.className).toContain("w-8");
  });

  it("applies large size", () => {
    const { container } = render(
      <Avatar initials="AB" gradientFrom="#fff" gradientTo="#000" size="lg" />
    );
    expect(container.firstElementChild?.className).toContain("w-16");
  });

  it("applies xl size", () => {
    const { container } = render(
      <Avatar initials="AB" gradientFrom="#fff" gradientTo="#000" size="xl" />
    );
    expect(container.firstElementChild?.className).toContain("w-24");
  });
});
