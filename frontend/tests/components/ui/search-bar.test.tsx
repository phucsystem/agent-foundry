import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar, FilterButton } from "@/components/ui/search-bar";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(
      <SearchBar value="" onChange={vi.fn()} placeholder="Search agents..." />
    );
    expect(screen.getByPlaceholderText("Search agents...")).toBeInTheDocument();
  });

  it("displays current value", () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("test query")).toBeInTheDocument();
  });

  it("calls onChange with new value", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new" },
    });
    expect(handleChange).toHaveBeenCalledWith("new");
  });

  it("renders children (e.g. filter buttons)", () => {
    render(
      <SearchBar value="" onChange={vi.fn()}>
        <button type="button">Filter</button>
      </SearchBar>
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });
});

describe("FilterButton", () => {
  it("renders label", () => {
    render(<FilterButton label="Category" />);
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<FilterButton label="Filter" onClick={handleClick} />);
    fireEvent.click(screen.getByText("Filter"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
