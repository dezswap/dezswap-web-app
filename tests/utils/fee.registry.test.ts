import { describe, expect, it } from "vitest";

import { getChain } from "../../src/constants/dezswap";
import { calculateStdFee } from "../../src/utils/fee";

describe("XPLA fees from the patched chain registry", () => {
  it.each([
    {
      chainName: "xpla",
      gasPrice: 10_000_000_000_000,
      feeAmount: "1400000000000000000",
    },
    {
      chainName: "xplatestnet",
      gasPrice: 1_200_000_000_000,
      feeAmount: "168000000000000000",
    },
  ])(
    "uses the patched prices for $chainName",
    ({ chainName, gasPrice, feeAmount }) => {
      expect(getChain(chainName)[0]?.fees?.feeTokens[0]).toMatchObject({
        denom: "axpla",
        fixedMinGasPrice: gasPrice,
        lowGasPrice: gasPrice,
        averageGasPrice: gasPrice,
        highGasPrice: gasPrice,
      });
      expect(calculateStdFee(100000n, chainName)).toEqual({
        gas: "140000",
        amount: [{ denom: "axpla", amount: feeAmount }],
      });
    },
  );
});
