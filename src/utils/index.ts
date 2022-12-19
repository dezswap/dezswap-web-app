import { Numeric } from "@xpla/xpla.js";
import { nativeTokens } from "constants/network";

export const formatDecimals = (value: Numeric.Input, decimals = 18) => {
  const t = Numeric.parse(value).toString();
  return t.includes(".") && (t.split(".").pop()?.length || 0) > decimals
    ? t.slice(0, t.indexOf(".")) +
        t.slice(t.indexOf("."), t.indexOf(".") + decimals + 1)
    : t;
};

export const cutDecimal = (value: Numeric.Input, decimals: number) =>
  (Math.floor(Number(value) * 10 ** decimals) / 10 ** decimals).toFixed(
    decimals,
  );

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
    return Numeric.parse(value || 0)
      .mul(10 ** decimals)
      .toFixed(0);
  } catch (error) {
    return undefined;
  }
};

export const amountToValue = (value?: Numeric.Input, decimals = 18) => {
  if (typeof value === "undefined") {
    return undefined;
  }
  try {
    return Numeric.parse(value || 0)
      .mul(10 ** -decimals)
      .toFixed(decimals);
  } catch (error) {
    return undefined;
  }
};

export const amountToNumber = (value?: Numeric.Input, decimals = 18) => {
  if (typeof value === "undefined") {
    return undefined;
  }
  try {
    const parsed = Numeric.parse(value || 0)
      .mul(10 ** -decimals)
      .toNumber();
    const intAndDec = parsed.toString().split(".");
    const decimalCount =
      intAndDec.length > 1 && intAndDec[1].length > 1
        ? intAndDec[1].length - 1
        : 0;
    /* ceiling last decimal for minimum accuracy */
    return Math.ceil(parsed * 10 ** decimalCount) / 10 ** decimalCount;
  } catch (error) {
    return undefined;
  }
};

export const getTransactionLink = (txHash?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/tx/${txHash}`;
