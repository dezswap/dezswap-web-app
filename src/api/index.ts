import axios from "axios";
import { apiAddresses } from "constants/dezswap";
import { Notification } from "stores/notifications";
import { Pair, Pairs, Pool, Token } from "types/api";
import {
  DashboardChartDuration,
  DashboardChartResponse,
  DashboardChartType,
  DashboardPoolDetailResponse,
  DashboardPoolsResponse,
  DashboardRecentResponse,
  DashboardStatisticsResponse,
  DashboardTokenChartType,
  DashboardTokenDetailResponse,
  DashboardTokensResponse,
  DashboardTransactionsResponse,
} from "types/dashboard-api";

export type ApiVersion = "v1";

const getBaseUrl = (networkName: string, version: ApiVersion = "v1") => {
  if (!Object.keys(apiAddresses).includes(networkName)) return "";
  return `${apiAddresses[networkName]?.baseUrl || ""}/${version}`;
};

const api = (networkName: string, version: ApiVersion = "v1") => {
  const apiClient = axios.create({
    baseURL: getBaseUrl(networkName, version),
  });

  apiClient.interceptors.request.use((config) => {
    const newConfig = { ...config };
    newConfig.params = { [Date.now()]: "", ...newConfig.params };
    return newConfig;
  });

  if (version === "v1") {
    return {
      async getPairs() {
        const res = await apiClient.get<Pairs>(`/pairs`);
        return res.data;
      },
      async getPair(address: string) {
        const res = await apiClient.get<Pair>(`/pairs/${address}`);
        return res.data;
      },
      async getPools() {
        const res = await apiClient.get<Pool[]>(`/pools`);
        return res.data;
      },
      async getPool(address: string) {
        const res = await apiClient.get<Pool>(`/pools/${address}`);
        return res.data;
      },
      async getTokens() {
        const res = await apiClient.get<Token[]>(`/tokens`);
        return res.data;
      },
      async getToken(address: string) {
        const res = await apiClient.get<Token>(`/tokens/${address}`);
        return res.data;
      },
      async getNotices(params?: {
        chain?: string;
        after?: number;
        limit?: number;
        asc?: boolean;
      }) {
        const res = await apiClient.get<Notification[]>(`/notices`, {
          params,
          baseURL: getBaseUrl("xpla", version),
        });
        return res.data;
      },
      dashboard: {
        async getPools(token?: string) {
          const res = await apiClient.get<DashboardPoolsResponse>(
            `/dashboard/pools`,
            { params: { token } },
          );
          return res.data;
        },
        async getPoolDetail(address: string) {
          const res = await apiClient.get<DashboardPoolDetailResponse>(
            `dashboard/pools/${address}`,
          );
          return res.data;
        },
        async getRecent() {
          const res = await apiClient.get<DashboardRecentResponse>(
            `/dashboard/recent`,
          );
          return res.data;
        },
        async getChart({
          type,
          duration,
        }: {
          duration?: DashboardChartDuration;
          type: DashboardChartType;
        }) {
          const res = await apiClient.get<DashboardChartResponse>(
            `/dashboard/chart/${type}`,
            { params: { duration } },
          );
          return res.data;
        },
        async getTokenChart({
          address,
          duration,
          type,
        }: {
          address: string;
          duration?: DashboardChartDuration;
          type: DashboardTokenChartType;
        }) {
          const res = await apiClient.get<DashboardChartResponse>(
            `/dashboard/chart/tokens/${encodeURIComponent(address)}/${type}`,
            { params: { duration } },
          );
          return res.data;
        },
        async getPoolChart({
          address,
          duration,
          type,
        }: {
          address: string;
          duration?: DashboardChartDuration;
          type: DashboardChartType;
        }) {
          const res = await apiClient.get<DashboardChartResponse>(
            `/dashboard/chart/pools/${encodeURIComponent(address)}/${type}`,
            { params: { duration } },
          );
          return res.data;
        },
        async getStatistics() {
          const res = await apiClient.get<DashboardStatisticsResponse>(
            `/dashboard/statistics`,
          );
          return res.data;
        },
        async getTokens() {
          const res = await apiClient.get<DashboardTokensResponse>(
            `/dashboard/tokens`,
          );
          return res.data;
        },
        async getTokenDetail(address: string) {
          const res = await apiClient.get<DashboardTokenDetailResponse>(
            `/dashboard/tokens/${encodeURIComponent(address)}`,
          );
          return res.data;
        },
        async getTransactions(params?: { pool?: string; token?: string }) {
          const res = await apiClient.get<DashboardTransactionsResponse>(
            `/dashboard/txs`,
            { params },
          );
          return res.data;
        },
      },
    };
  }

  throw new Error(`Unsupported API version: ${version}`);
};

export default api;
