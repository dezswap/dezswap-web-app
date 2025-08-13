import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { AccAddress } from "@xpla/xpla.js";
import useCustomAssets from "hooks/useCustomAssets";
import { useQuery } from "@tanstack/react-query";
import { Token } from "types/api";
import useNativeTokens from "./useNativeTokens";

const useAssets = () => {
  const api = useAPI();
  const { chainName } = useNetwork();
  const { getCustomAsset, customAssets } = useCustomAssets();
  const { nativeTokens } = useNativeTokens();
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
    (address: string | undefined) =>
      address &&
      (AccAddress.validate(address) ||
        nativeTokens?.some((n) => n.token === address) ||
        assets?.find((item) => item.token === address)?.verified),
    [assets, nativeTokens],
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
