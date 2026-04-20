import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { apiAddresses } from "~/constants/dezswap";

import { chainNameStore } from "~/stores/chainName";

const instance = Axios.create();

/**
 * Replace encoded slashes in a URL with a surrogate form the API restores
 * server-side. GCP load balancer rejects paths containing `%2F`, and currently
 * only IBC denoms (`ibc/XXX`) carry slashes through path segments.
 *
 * See https://github.com/dezswap/dezswap-api/pull/93.
 */
const applySlashSurrogate = (url?: string) => url?.replace(/ibc%2F/g, "ibc-");

instance.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  config.params = { [Date.now()]: "", ...config.params };
  config.url = applySlashSurrogate(config.url);
  return config;
});

const getBaseUrl = () => {
  const currentNetworkName = chainNameStore.getState().chainName;
  const baseUrl = apiAddresses[currentNetworkName]?.baseUrl ?? "";
  return `${baseUrl}/v1`;
};

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return instance({ ...config, ...options }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
