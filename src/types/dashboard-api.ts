export type DashboardChartDuration = "year" | "quarter" | "month" | "all";

export type DashboardChartType = "volume" | "tvl" | "apr" | "fee";
export type DashboardTokenChartType = "volume" | "tvl" | "price";

export type DashboardPool = {
  address: string;
  tvl: string;
  volume: string;
  fee: string;
  apr: string;
};

export type DashboardRecent = {
  volume: string;
  volumeChangeRate: number;
  fee: string;
  feeChangeRate: number;
  tvl: string;
  tvlChangeRate: number;
  apr: number;
  aprChangeRate: number;
};

export type DashboardTransaction = {
  action: string;
  actionDisplay: string;
  address: string;
  hash: string;
  totalValue: string;
  asset0: string;
  asset0amount: string;
  asset1: string;
  asset1amount: string;
  account: string;
  timestamp: string;
};

export type DashboardToken = {
  address: string;
  price: string;
  priceChange: number;
  volume24h: string;
  volume24hChange: string;
  volume7d: string;
  volume7dChange: string;
  tvl: string;
  tvlChange: string;
  fee: string;
};

export type DashboardChartItem = {
  t: string;
  v: string;
};

export type DashboardRecentResponse = DashboardRecent;

export type DashboardPoolsResponse = DashboardPool[];
export type DashboardPoolDetailResponse = {
  recent: DashboardRecent;
  txs: DashboardTransaction[];
};
export type DashboardTransactionsResponse = DashboardTransaction[];
export type DashboardTokensResponse = DashboardToken[];

export type DashboardTokenDetailResponse = DashboardToken;

export type DashboardStatisticsResponse = {
  addressCount: number;
  txCount: number;
  fee: string;
  timestamp: string;
}[];

export type DashboardChartResponse = DashboardChartItem[];
