import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "@/components/ui/star-rating";

describe("StarRating", () => {
  it("renders correct number of stars", () => {
    const { container } = render(<StarRating rating={3} />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.children).toHaveLength(5);
  });

  it("renders custom maxStars", () => {
    const { container } = render(<StarRating rating={2} maxStars={10} />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.children).toHaveLength(10);
  });

  it("fills correct number of stars", () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = Array.from(container.firstElementChild!.children);
    const filledStars = stars.filter((star) =>
      star.className.includes("text-warning")
    );
    expect(filledStars).toHaveLength(3);
  });

  it("calls onRate when interactive and star clicked", () => {
    const handleRate = vi.fn();
    render(<StarRating rating={2} interactive onRate={handleRate} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);
    expect(handleRate).toHaveBeenCalledWith(4);
  });

  it("does not render buttons when not interactive", () => {
    render(<StarRating rating={3} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("supports keyboard interaction", () => {
    const handleRate = vi.fn();
    render(<StarRating rating={1} interactive onRate={handleRate} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[2], { key: "Enter" });
    expect(handleRate).toHaveBeenCalledWith(3);
  });
});
