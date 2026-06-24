import { describe, expect, it } from "vitest";

import { formatTokenPrice } from "../../src/utils";

describe("formatTokenPrice", () => {
  describe("value >= $1 (2 decimal places)", () => {
    it("formats $123.456 as $123.46", () => {
      expect(formatTokenPrice(123.456)).toBe("$123.46");
    });

    it("formats $1.23456 as $1.23", () => {
      expect(formatTokenPrice(1.23456)).toBe("$1.23");
    });

    it("formats exactly $1 as $1.00", () => {
      expect(formatTokenPrice(1)).toBe("$1.00");
    });

    it("compacts large values (1,234,567 as $1.2M)", () => {
      expect(formatTokenPrice(1234567)).toBe("$1.2M");
    });
  });

  describe("$0.000001 <= value < $1 (4 significant digits)", () => {
    it("formats $0.123456 as $0.1235", () => {
      expect(formatTokenPrice(0.123456)).toBe("$0.1235");
    });

    it("formats $0.012345 as $0.01235", () => {
      expect(formatTokenPrice(0.012345)).toBe("$0.01235");
    });

    it("formats $0.001234 as $0.001234", () => {
      expect(formatTokenPrice(0.001234)).toBe("$0.001234");
    });

    it("formats $0.003456 as $0.003456", () => {
      expect(formatTokenPrice(0.003456)).toBe("$0.003456");
    });

    it("formats boundary $0.01 as $0.01", () => {
      expect(formatTokenPrice(0.01)).toBe("$0.01");
    });

    it("formats boundary $0.000001 as $0.000001", () => {
      expect(formatTokenPrice(0.000001)).toBe("$0.000001");
    });
  });

  describe("value < $0.000001 (lower bound)", () => {
    it("formats 0.0000001 as < $0.000001", () => {
      expect(formatTokenPrice(0.0000001)).toBe("< $0.000001");
    });
  });

  describe("zero and non-positive", () => {
    it("formats 0 as $0", () => {
      expect(formatTokenPrice(0)).toBe("$0");
    });

    it("formats negative values as $0", () => {
      expect(formatTokenPrice(-0.5)).toBe("$0");
    });
  });
});
