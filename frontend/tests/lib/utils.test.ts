import { describe, it, expect } from "vitest";
import { formatFileSize } from "@/lib/utils";

describe("formatFileSize", () => {
  it("returns bytes for values under 1024", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("converts to KB for values >= 1024", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("handles large files", () => {
    expect(formatFileSize(10240)).toBe("10.0 KB");
    expect(formatFileSize(102400)).toBe("100.0 KB");
  });
});
