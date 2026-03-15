import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input, Textarea } from "@/components/ui/input";

describe("Input", () => {
  it("renders without label", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Name" id="name" />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("renders helper text", () => {
    render(<Input helper="This is helpful" />);
    expect(screen.getByText("This is helpful")).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hello" },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  it("passes through HTML attributes", () => {
    render(<Input type="email" required />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
  });
});

describe("Textarea", () => {
  it("renders without label", () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Textarea label="Description" id="desc" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("renders helper text", () => {
    render(<Textarea helper="Max 500 chars" />);
    expect(screen.getByText("Max 500 chars")).toBeInTheDocument();
  });
});
