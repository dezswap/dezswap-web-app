import { GasPrice, calculateFee } from "@interchainjs/cosmos/utils/fee";
import type { StdFee } from "@interchainjs/types";

import { getChain } from "~/constants/dezswap";

interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

interface GasConfig {
  multiplier: Fraction;
  gasPrice: `${number}${string}`; // GasPrice.fromString format, e.g. "850000000000axpla"
}

const GAS_CONFIG_OVERRIDES: Partial<Record<string, GasConfig>> = {
  fetchhub: {
    multiplier: { numerator: 14n, denominator: 10n },
    gasPrice: "2afet",
  },
  fetchhubtestnet: {
    multiplier: { numerator: 12n, denominator: 10n },
    gasPrice: "1000000000atestfet",
  },
};

const DEFAULT_MULTIPLIER = {
  numerator: 14n,
  denominator: 10n,
} as const satisfies Fraction;

const getGasPrice = (chainName: string): GasPrice => {
  const override = GAS_CONFIG_OVERRIDES[chainName]?.gasPrice;
  if (override) return GasPrice.fromString(override);

  const feeToken = getChain(chainName)[0]?.fees?.feeTokens?.[0];
  if (typeof feeToken?.averageGasPrice === "number") {
    return GasPrice.fromString(`${feeToken.averageGasPrice}${feeToken.denom}`);
  }

  throw new Error(`No gas price config for chain: ${chainName}`);
};

const getMultiplier = (chainName: string): Fraction =>
  GAS_CONFIG_OVERRIDES[chainName]?.multiplier ?? DEFAULT_MULTIPLIER;

/** Ceil division: (gasUsed * numerator + denominator - 1) / denominator */
const applyMultiplier = (gasUsed: bigint, multiplier: Fraction): bigint =>
  (gasUsed * multiplier.numerator + multiplier.denominator - 1n) /
  multiplier.denominator;

export const calculateStdFee = (gasUsed: bigint, chainName: string): StdFee => {
  const multiplier = getMultiplier(chainName);
  const gasLimit = applyMultiplier(gasUsed, multiplier);
  const gasPrice = getGasPrice(chainName);
  return calculateFee(gasLimit, gasPrice);
};
