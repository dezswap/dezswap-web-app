import { Numeric } from "@xpla/xpla.js";
import { IBC_PREFIX, nativeTokens, XPLA_ADDRESS } from "constants/network";
import { Decimal } from "decimal.js";

export const formatDecimals = (value: Numeric.Input, decimals = 18) => {
  const t = Numeric.parse(value).toString();
  return t.includes(".") && (t.split(".").pop()?.length || 0) > decimals
    ? t.slice(0, t.indexOf(".")) +
        t.slice(t.indexOf("."), t.indexOf(".") + decimals + 1)
    : t;
};

export const cutDecimal = (value: Numeric.Input, decimals: number) =>
  Numeric.parse(value).toFixed(decimals, Decimal.ROUND_FLOOR);

export const isNativeTokenAddress = (network: string, address: string) =>
  nativeTokens[network].filter((n) => n.token === address).length > 0;

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

export const convertIbcTokenAddressForPath = (address?: string) =>
  address?.replace("ibc/", "ibc-");

export const revertIbcTokenAddressInPath = (address?: string) =>
  address?.startsWith("ibc-") ? address?.replace("ibc-", "ibc/") : address;

export const getIbcTokenHash = (address?: string) =>
  address ? address?.slice(IBC_PREFIX) : "";

export const formatRatio = (value: number) => {
  if (value > 99.99) {
    return "99.99";
  }
  if (value < 0.01 && value > 0) {
    return "< 0.01";
  }
  return value.toFixed(2);
};

type DateConstructorInput = ConstructorParameters<DateConstructor>[0];

export const formatDateTime = (input: DateConstructorInput) => {
  const date = new Date(input);
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(date);
};

export const formatDate = (input: DateConstructorInput) => {
  const date = new Date(input);
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const getFromNow = (input: DateConstructorInput) => {
  const date = new Date(input);
  const diffSecs = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(diffSecs / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  const rtf = new Intl.RelativeTimeFormat("en-us", { numeric: "auto" });

  if (years > 0) {
    return rtf.format(-years, "year");
  }
  if (months > 0) {
    return rtf.format(-months, "month");
  }
  if (days > 0) {
    return rtf.format(-days, "day");
  }
  if (hours > 0) {
    return rtf.format(-hours, "hour");
  }
  if (minutes > 0) {
    return rtf.format(-minutes, "minute");
  }
  return rtf.format(-diffSecs, "second");
};
export const getRemainDays = (input: DateConstructorInput) => {
  const date = new Date(input);
  const now = new Date();

  const diff = date.getTime() - now.getTime();
  const res = Math.ceil(diff / (1000 * 3600 * 24));
  return res > 0 ? res : 0;
};

const getBigNumberFormatOptions = (
  value: Numeric.Input,
): Intl.NumberFormatOptions => {
  const numericValue = Numeric.parse(value);
  const notation = numericValue.abs().lt(1000000) ? "standard" : "compact";
  return {
    notation,
    compactDisplay: "short",
  };
};

export const formatNumber = (
  value: Numeric.Input,
  options?: Intl.NumberFormatOptions,
) => {
  if (!Decimal.isDecimal(value) && Number.isNaN(Number(value))) {
    return undefined;
  }
  return Intl.NumberFormat("en-us", options).format(
    Numeric.parse(value).toNumber(),
  );
};

export const formatBigNumber = (value: Numeric.Input) => {
  return formatNumber(value, getBigNumberFormatOptions(value));
};

export const formatCurrency = (value: Numeric.Input) => {
  const bigNumberFormatOptions = getBigNumberFormatOptions(value);
  if (Numeric.parse(value).lt(0.01)) {
    return `$${formatNumber(value, {
      ...bigNumberFormatOptions,
      maximumSignificantDigits: 2,
    })}`;
  }
  return formatNumber(value, {
    ...bigNumberFormatOptions,
    style: "currency",
    currency: "USD",
  });
};
