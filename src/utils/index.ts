import { Numeric } from "@xpla/xpla.js";
import { nativeTokens, XPLA_ADDRESS } from "constants/network";
import { Decimal } from "decimal.js";

export const formatDecimals = (value: Numeric.Input, decimals = 18) => {
  const t = Numeric.parse(value).toString();
  return t.includes(".") && (t.split(".").pop()?.length || 0) > decimals
    ? t.slice(0, t.indexOf(".")) +
        t.slice(t.indexOf("."), t.indexOf(".") + decimals + 1)
    : t;
};

// Intl doesn't cover all floating point numbers
export const formatNumber = (value?: Decimal.Value) => {
  if (!value && value !== 0) {
    return "";
  }
  if (Number.isNaN(Number(value)) || new Decimal(value).isNaN()) {
    throw new Error("Invalid number");
  }
  const [number, decimal] = `${value}`.split(".");
  return `${number.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${
    decimal ? `.${decimal}` : ""
  }`;
};

export const cutDecimal = (value: Numeric.Input, decimals: number) =>
  Numeric.parse(value).toFixed(decimals, Decimal.ROUND_FLOOR);

export const isNativeTokenAddress = (network: string, address: string) =>
  nativeTokens[network].filter((n) => n.address === address).length > 0;

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
      .toString();

    return d === "0" ? e : d + e.padStart(decimals, "0");
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
      .toFixed(decimals, Decimal.ROUND_FLOOR);
  } catch (error) {
    return undefined;
  }
};

export const filterNumberFormat = (value: string, decimals = 18) => {
  if (!value || value.length < 2) {
    return value?.replace(/[^0-9]/g, "");
  }

  let t = 0;
  let v = 0;
  // remove redundant zeros
  // replace non-digit characters and preceding multiple zeros
  const filtered = value.replaceAll(/[0\\.]/g, "").length
    ? value
        .replace(/[^0-9\\.]/g, "")
        .replace(/^[0]+[\\.]/g, (match: string) => {
          v += 1;
          return v === 1 ? "0." : match;
        })
        .replace(/[\\.]/g, (match: string) => {
          t += 1;
          return t === 2 ? "" : match;
        })
    : "0";

  // decimal count check
  return filtered.includes(".") &&
    (filtered.split(".").pop()?.length || 0) > decimals
    ? filtered.slice(0, filtered.indexOf(".")) +
        filtered.slice(
          filtered.indexOf("."),
          filtered.indexOf(".") + decimals + 1,
        )
    : filtered;
};

export const getBlockLink = (height?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/block/${height}`;

export const getAddressLink = (address?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/address/${address}`;

export const getTransactionLink = (txHash?: string, network?: string) =>
  `https://explorer.xpla.io/${network}/tx/${txHash}`;

export const getTokenLink = (address?: string, network?: string) => {
  return `https://explorer.xpla.io/${network}/token/${
    address === XPLA_ADDRESS ? "xpla" : address
  }`;
};
