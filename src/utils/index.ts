import { Dec, Numeric } from "@xpla/xpla.js";
import { nativeTokens } from "constants/network";
import { Decimal } from "decimal.js";

export const formatDecimals = (value: Numeric.Input, decimals = 18) => {
  const t = Numeric.parse(value).toString();
  return t.includes(".") && (t.split(".").pop()?.length || 0) > decimals
    ? t.slice(0, t.indexOf(".")) +
        t.slice(t.indexOf("."), t.indexOf(".") + decimals + 1)
    : t;
};

export const formatNumber = (value: number | string) =>
  !value
    ? "0"
    : Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(
        Number(value),
      );

export const cutDecimal = (value: Numeric.Input, decimals: number) =>
  Numeric.parse(value).toFixed(decimals, Decimal.ROUND_FLOOR);

export const isNativeTokenAddress = (address: string) =>
  nativeTokens.filter((n) => n.address === address).length > 0;

export const ellipsisCenter = (text = "", letterCountPerSide = 6) => {
  if (text.length <= letterCountPerSide * 2 + 3) {
    return text;
  }
  return `${text.substring(0, letterCountPerSide)}...${text.substring(
    text.length - letterCountPerSide,
  )}`;
};

export const valueToAmount = (value?: Numeric.Input, decimals = 18) => {
  if (typeof value === "undefined" || value === "") {
    return undefined;
  }
  try {
    const n = Numeric.parse(value || 0);
    const d = n.toFixed(0, Decimal.ROUND_FLOOR);

    const e = n
      .minus(d)
      .mul(10 ** decimals)
      .toString()
      .padStart(decimals, "0");

    return d + e;
  } catch (error) {
    return undefined;
  }
};

export const amountToValue = (value?: Numeric.Input, decimals = 18) => {
  if (typeof value === "undefined") {
    return undefined;
  }
  try {
    const s = value.toString();
    if (s.length < decimals) {
      return Dec.withPrec(value, decimals).toString();
    }
    return `${s.substring(0, s.length - decimals)}.${s.substring(
      s.length - decimals,
      s.length,
    )}`;
  } catch (error) {
    return undefined;
  }
};

export const getBlockLink = (height?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/block/${height}`;

export const getWalletLink = (address?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/address/${address}`;

export const getTransactionLink = (txHash?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/tx/${txHash}`;
