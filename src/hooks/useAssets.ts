import { useCallback, useMemo } from "react";

import { useGetTokens } from "~/api/dezswap";

import useCustomAssets from "~/hooks/useCustomAssets";
import { useNetwork } from "~/hooks/useNetwork";

import { Token } from "~/types/api";

import useFetchDecimal from "./useFetchDecimal";
import useNativeTokens from "./useNativeTokens";

const useAssets = () => {
  const { chainName } = useNetwork();
  const { nativeTokens } = useNativeTokens();
  const { getCustomAsset, customAssets } = useCustomAssets();
  const { fetchDecimal } = useFetchDecimal();
  const { data: assets } = useGetTokens({
    query: {
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

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
      [...(assets ?? []), ...(customAssets ?? [])]?.reduce(
        (acc, token) => {
          if (token.token) {
            acc[token.token] = token;
          }
          return acc;
        },
        {} as Record<string, Token>,
      ),
    [assets, customAssets],
  );

  const validate = useCallback(
    async (address: string | undefined) => {
      if (!address) return false;

      let decimal;
      try {
        decimal = await fetchDecimal(address);
      } catch (e) {
        console.error("Error fetching decimal for address:", address, e);
      }

      return (
        decimal !== undefined ||
        nativeTokens?.some((n) => n.token === address) ||
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
