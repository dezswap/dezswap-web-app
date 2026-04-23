import { describe, expect, it, vi } from "vitest";

import { calculateStdFee } from "../../src/utils/fee";

vi.mock("../../src/constants/dezswap", () => ({
  getChain: (chainName: string) => {
    if (chainName === "xpla") {
      return [
        {
          fees: {
            feeTokens: [{ denom: "axpla", averageGasPrice: 100 }],
          },
        },
      ];
    }
    return [{}];
  },
}));

describe("calculateStdFee", () => {
  it("applies default multiplier (1.4x) with ceil for xpla chain", () => {
    const result = calculateStdFee(100000n, "xpla");

    // gasLimit = ceil(100000 * 14 / 10) = 140000
    expect(result.gas).toBe("140000");
    // fee amount = 140000 * 100 = 14000000
    expect(result.amount).toEqual([{ denom: "axpla", amount: "14000000" }]);
  });

  it("uses override config for fetchhub", () => {
    const result = calculateStdFee(100000n, "fetchhub");

    // gasLimit = ceil(100000 * 14 / 10) = 140000
    expect(result.gas).toBe("140000");
    // fee amount = 140000 * 2 = 280000
    expect(result.amount).toEqual([{ denom: "afet", amount: "280000" }]);
  });

  it("uses override config for fetchhubtestnet", () => {
    const result = calculateStdFee(100000n, "fetchhubtestnet");

    // gasLimit = ceil(100000 * 12 / 10) = 120000
    expect(result.gas).toBe("120000");
    // fee amount = 120000 * 1000000000 = 120000000000000
    expect(result.amount).toEqual([
      { denom: "atestfet", amount: "120000000000000" },
    ]);
  });

  it("ceil division rounds up correctly", () => {
    const result = calculateStdFee(7n, "xpla");

    // gasLimit = ceil(7 * 14 / 10) = ceil(9.8) = 10
    expect(result.gas).toBe("10");
    // fee amount = 10 * 100 = 1000
    expect(result.amount).toEqual([{ denom: "axpla", amount: "1000" }]);
  });

  it("throws for unknown chain with no gas price config", () => {
    expect(() => calculateStdFee(100000n, "unknown")).toThrow(
      "No gas price config for chain: unknown",
    );
  });
});
