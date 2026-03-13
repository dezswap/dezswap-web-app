import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { apiAddresses } from "~/constants/dezswap";

let currentNetworkName = "";

export const setNetworkName = (networkName: string) => {
  currentNetworkName = networkName;
};

export const getNetworkName = () => currentNetworkName;

const getBaseUrl = () => {
  const baseUrl = apiAddresses[currentNetworkName]?.baseUrl || "";
  return `${baseUrl}/v1`;
};

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const instance = Axios.create({
    baseURL: getBaseUrl(),
  });

  instance.interceptors.request.use((reqConfig) => {
    const newConfig = { ...reqConfig };
    newConfig.params = { [Date.now()]: "", ...newConfig.params };
    return newConfig;
  });

  return instance({ ...config, ...options }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
