import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/ui/pagination";

describe("Pagination", () => {
  it("renders all pages when total <= 7", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />
    );
    for (let page = 1; page <= 5; page++) {
      expect(screen.getByText(String(page))).toBeInTheDocument();
    }
  });

  it("highlights the current page", () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />
    );
    const currentButton = screen.getByText("3");
    expect(currentButton.className).toContain("bg-primary");
  });

  it("calls onPageChange when a page is clicked", () => {
    const handleChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />
    );
    fireEvent.click(screen.getByText("3"));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("shows ellipsis for many pages", () => {
    render(
      <Pagination currentPage={5} totalPages={20} onPageChange={vi.fn()} />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
