import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { isNativeTokenAddress } from "utils";
import useCustomAssets from "hooks/useCustomAssets";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // useQueryClient 추가

const useAssets = () => {
  const api = useAPI();
  const { chainName } = useNetwork();
  const { getCustomAsset } = useCustomAssets();
  const queryClient = useQueryClient();

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
    (address: string) => {
      const asset = assets?.find((item) => item.token === address);
      if (!asset?.token) {
        return getCustomAsset(address);
      }
      return asset;
    },
    [assets, getCustomAsset],
  );
  const fetchDecimal = useCallback(
    async (tokenAddress: string) => {
      return await queryClient.fetchQuery(
        ["decimal", tokenAddress],
        () => api.getDecimal(tokenAddress),
        {
          staleTime: Infinity,
          cacheTime: Infinity,
        },
      );
    },
    [api, queryClient],
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

  const getValidCoins = useCallback(
    async (
      coinsToCheck: {
        address: string;
        amount: string;
      }[],
    ) => {
      const validCoins: {
        address: string;
        amount: string;
      }[] = [];

      await Promise.all(
        coinsToCheck.map(async (coin) => {
          try {
            const decimal = await fetchDecimal(coin.address);
            if (decimal !== undefined) {
              validCoins.push(coin);
            }
          } catch (e) {
            console.error(`Error validating coin ${coin.address}:`, e);
          }
        }),
      );

      console.log("Original Assets:", coinsToCheck, "Valid Coins:", validCoins);
      return validCoins;
    },
    [fetchDecimal],
  );

  return useMemo(
    () => ({
      getAsset,
      validate,
      getValidCoins,
    }),
    [getAsset, validate,getValidCoins],
  );
};

export default useAssets;
