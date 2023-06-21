import axios from "axios";
import { apiAddresses } from "constants/dezswap";
import { Pair, Pairs, Pool, Token } from "types/api";
import { NetworkName } from "types/common";

export type ApiVersion = "v1";

const api = (networkName: NetworkName, version: ApiVersion = "v1") => {
  const apiClient = axios.create({
    baseURL: `${apiAddresses[networkName]?.baseUrl || ""}/${version}`,
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
    };
  }

  throw new Error(`Unsupported API version: ${version}`);
};

export default api;
