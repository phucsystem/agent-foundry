import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "@/components/ui/tabs";

describe("Tabs", () => {
  const items = ["Overview", "Tasks", "Settings"];

  it("renders all tab items", () => {
    render(<Tabs items={items} activeIndex={0} onTabChange={vi.fn()} />);
    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("highlights the active tab", () => {
    render(<Tabs items={items} activeIndex={1} onTabChange={vi.fn()} />);
    const activeTab = screen.getByText("Tasks");
    expect(activeTab.className).toContain("text-primary");
    expect(activeTab.className).toContain("border-primary");
  });

  it("does not highlight inactive tabs", () => {
    render(<Tabs items={items} activeIndex={0} onTabChange={vi.fn()} />);
    const inactiveTab = screen.getByText("Settings");
    expect(inactiveTab.className).toContain("border-transparent");
  });

  it("calls onTabChange with correct index on click", () => {
    const handleChange = vi.fn();
    render(<Tabs items={items} activeIndex={0} onTabChange={handleChange} />);
    fireEvent.click(screen.getByText("Settings"));
    expect(handleChange).toHaveBeenCalledWith(2);
  });
});
