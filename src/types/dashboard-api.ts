export type {
  DashboardPoolRes as DashboardPool,
  DashboardRecentRes as DashboardRecent,
  DashboardTxRes as DashboardTransaction,
  DashboardTokenRes as DashboardToken,
  DashboardChartItem,
} from "~/api/dezswap/models";

export type DashboardChartDuration = "year" | "quarter" | "month" | "all";
export type DashboardChartType = "volume" | "tvl" | "apr" | "fee";
export type DashboardTokenChartType = "volume" | "tvl" | "price";
