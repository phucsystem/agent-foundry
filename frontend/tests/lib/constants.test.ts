import { describe, it, expect } from "vitest";
import {
  NAV_ITEMS,
  AGENT_COLORS,
  TASK_STATUS_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/constants";

describe("NAV_ITEMS", () => {
  it("has 4 navigation items", () => {
    expect(NAV_ITEMS).toHaveLength(4);
  });

  it("each item has label, href, and icon", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeTruthy();
      expect(item.href).toMatch(/^\//);
      expect(item.icon).toBeTruthy();
    }
  });
});

describe("AGENT_COLORS", () => {
  it("has entries for known agent types", () => {
    expect(AGENT_COLORS.coder).toBeDefined();
    expect(AGENT_COLORS.research).toBeDefined();
    expect(AGENT_COLORS.pm).toBeDefined();
  });

  it("each entry has from and to colors", () => {
    for (const [, colors] of Object.entries(AGENT_COLORS)) {
      expect(colors.from).toMatch(/^#/);
      expect(colors.to).toMatch(/^#/);
    }
  });
});

describe("TASK_STATUS_CONFIG", () => {
  it("covers all task statuses", () => {
    expect(TASK_STATUS_CONFIG.queued).toBeDefined();
    expect(TASK_STATUS_CONFIG.running).toBeDefined();
    expect(TASK_STATUS_CONFIG.completed).toBeDefined();
    expect(TASK_STATUS_CONFIG.failed).toBeDefined();
  });

  it("each status has label and variant", () => {
    for (const [, config] of Object.entries(TASK_STATUS_CONFIG)) {
      expect(config.label).toBeTruthy();
      expect(config.variant).toBeTruthy();
    }
  });
});

describe("PRIORITY_CONFIG", () => {
  it("covers high, medium, low priorities", () => {
    expect(PRIORITY_CONFIG.high).toBeDefined();
    expect(PRIORITY_CONFIG.medium).toBeDefined();
    expect(PRIORITY_CONFIG.low).toBeDefined();
  });

  it("each priority has label, bgClass, textClass", () => {
    for (const [, config] of Object.entries(PRIORITY_CONFIG)) {
      expect(config.label).toBeTruthy();
      expect(config.bgClass).toBeTruthy();
      expect(config.textClass).toBeTruthy();
    }
  });
});
