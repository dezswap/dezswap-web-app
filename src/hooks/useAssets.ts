import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { isNativeTokenAddress } from "utils";
import useCustomAssets from "hooks/useCustomAssets";
import { useQuery } from "@tanstack/react-query";
import useFetchDecimal from "./useFetchDecimal";
import { Token } from "types/api";

const useAssets = () => {
  const api = useAPI();
  const { chainName } = useNetwork();
  const { getCustomAsset, customAssets } = useCustomAssets();
  const { fetchDecimal } = useFetchDecimal();
  const { data: assets } = useQuery(
    ["assets", chainName],
    async () => {
      const res = await api.getTokens();
      return res;
    },
    {
      enabled: !!chainName,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  );

  const getAsset = useCallback(
    async (address: string) => {
      const asset = assets?.find((item) => item.token === address);
      if (!asset?.token) {
        return await getCustomAsset(address);
      }
      return asset;
    },
    [assets, getCustomAsset],
  );

  const assetInfos = useMemo(
    () =>
      [...(assets ?? []), ...(customAssets ?? [])]?.reduce((acc, token) => {
        if (token.token) {
          acc[token.token] = token;
        }
        return acc;
      }, {} as Record<string, Token>),
    [assets, customAssets],
  );

  const validate = useCallback(
    async (address: string | undefined) => {
      if (!address) return false;

      let decimal: number | undefined;
      try {
        decimal = await fetchDecimal(address);
      } catch (e) {
        console.error("Error fetching decimal for address:", address, e);
      }

      return (
        decimal !== undefined ||
        isNativeTokenAddress(chainName, address) ||
        assets?.find((item) => item.token === address)?.verified
      );
    },
    [assets, chainName, fetchDecimal],
  );

  return useMemo(
    () => ({
      getAsset,
      validate,
      assetInfos,
    }),
    [getAsset, validate, assetInfos],
  );
};

export default useAssets;
