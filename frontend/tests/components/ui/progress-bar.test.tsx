import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProgressBar } from "@/components/ui/progress-bar";

describe("ProgressBar", () => {
  function getInnerBar(container: HTMLElement): HTMLElement {
    const wrapper = container.firstElementChild!;
    return wrapper.firstElementChild as HTMLElement;
  }

  it("sets width based on percentage", () => {
    const { container } = render(<ProgressBar percentage={60} />);
    expect(getInnerBar(container).style.width).toBe("60%");
  });

  it("caps percentage at 100", () => {
    const { container } = render(<ProgressBar percentage={150} />);
    expect(getInnerBar(container).style.width).toBe("100%");
  });

  it("handles zero percentage", () => {
    const { container } = render(<ProgressBar percentage={0} />);
    expect(getInnerBar(container).style.width).toBe("0%");
  });

  it("applies animated class when animated", () => {
    const { container } = render(<ProgressBar percentage={50} animated />);
    expect(getInnerBar(container).className).toContain("animate-kanban-pulse");
  });

  it("applies custom color", () => {
    const { container } = render(
      <ProgressBar percentage={50} color="bg-success" />
    );
    expect(getInnerBar(container).className).toContain("bg-success");
  });
});
