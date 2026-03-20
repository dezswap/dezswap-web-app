import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { apiAddresses } from "~/constants/dezswap";

import { chainNameStore } from "~/stores/chainName";

const instance = Axios.create();

instance.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  config.params = { [Date.now()]: "", ...config.params };
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
