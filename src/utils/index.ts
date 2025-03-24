import { Numeric } from "@xpla/xpla.js";
import { IBC_PREFIX, nativeTokens, XPLA_ADDRESS } from "constants/network";
import { Decimal } from "decimal.js";
import { DashboardChartItem } from "types/dashboard-api";

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
    return Numeric.parse(value.toString() || 0)
      .mul(10 ** -decimals)
      .toFixed(decimals, Decimal.ROUND_FLOOR);
  } catch (error) {
    return undefined;
  }
};

export const sanitizeNumberInput = (value: string, decimals = 18) => {
  // Remove all non-numeric characters except decimal point and minus sign
  const regex = /[^0-9.]/g;
  const isNegative = value.startsWith("-");
  const sanitized = value.replace(regex, "");
  const [integerPart, decimalPart] = sanitized.split(".");

  return `${isNegative ? "-" : ""}${integerPart}${
    decimalPart !== undefined ? `.${decimalPart.slice(0, decimals)}` : ""
  }`;
};

const XPLA_MAINNET_EXPLORER = "https://explorer.xpla.io";
// TODO: delete the hard-coded explorer link.
export const getBlockLink = (height?: string, explorers?: string) => {
  if (explorers === XPLA_MAINNET_EXPLORER)
    return `${explorers}/mainnet/block/${height}`;
  return `${explorers}/block/${height}`;
};

export const getAddressLink = (address?: string, explorers?: string) => {
  if (explorers === XPLA_MAINNET_EXPLORER)
    return `${explorers}/mainnet/address/${address}`;
  return `${explorers}/address/${address}`;
};

export const getTransactionLink = (txHash?: string, explorers?: string) => {
  if (explorers === XPLA_MAINNET_EXPLORER)
    return `${explorers}/mainnet/tx/${txHash}`;
  return `${explorers}/tx/${txHash}`;
};

export const getTokenLink = (address?: string, explorers?: string) => {
  if (explorers === XPLA_MAINNET_EXPLORER)
    return `${explorers}/mainnet/token/${
      address === XPLA_ADDRESS ? "xpla" : address
    }`;
  return `${explorers}/token/${address === XPLA_ADDRESS ? "xpla" : address}`;
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

export const formatDateRange = (
  start?: DateConstructorInput,
  end?: DateConstructorInput,
) => {
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  let formattedStartDate = "Unknown";
  let formattedEndDate = "Unknown";

  if (startDate) {
    formattedStartDate =
      startDate.getFullYear() === endDate?.getFullYear()
        ? Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(startDate)
        : formatDate(startDate);
  }

  if (endDate) {
    formattedEndDate = formatDate(endDate);
  }

  return `${formattedStartDate} - ${formattedEndDate}`;
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
  try {
    return Intl.NumberFormat("en-us", options).format(
      Numeric.parse(value).toNumber(),
    );
  } catch (error) {
    return undefined;
  }
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

export const formatPercentage = (value: Numeric.Input) => {
  const numericValue = Numeric.parse(value);
  if (numericValue.lt(0)) {
    throw new Error("Percentage value cannot be negative");
  }
  if (numericValue.eq(0)) {
    return "0%";
  }

  const numberFormatOptions = {
    style: "percent",
    maximumFractionDigits: 2,
  };

  if (numericValue.lt(0.01)) {
    numberFormatOptions.maximumFractionDigits = 4;
  } else if (numericValue.lt(0.00001)) {
    numberFormatOptions.maximumFractionDigits = 6;
  }
  return formatNumber(numericValue.dividedBy(100), numberFormatOptions);
};

export const getSumOfDashboardChartData = (data: DashboardChartItem[]) => {
  const initialValue = "0";
  try {
    return data
      .reduce((prev, current) => {
        return prev.add(current.v);
      }, Numeric.parse(initialValue))
      .toString();
  } catch (error) {
    return initialValue;
  }
};
