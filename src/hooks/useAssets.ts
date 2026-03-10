import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { isBech32WithPrefix } from "utils";
import useCustomAssets from "hooks/useCustomAssets";
import { useQuery } from "@tanstack/react-query";
import useNativeTokens from "./useNativeTokens";

const useAssets = () => {
  const api = useAPI();
  const {
    chainName,
    selectedChain: { bech32Prefix },
  } = useNetwork();
  const { getCustomAsset } = useCustomAssets();
  const { nativeTokens } = useNativeTokens();
  const { data: assets } = useQuery({
    queryKey: ["assets", chainName],
    queryFn: async () => {
      const res = await api.getTokens();
      return res;
    },
    enabled: !!chainName,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

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

  const validate = useCallback(
    (address: string | undefined) =>
      address &&
      (isBech32WithPrefix(address, bech32Prefix) ||
        nativeTokens?.some((n) => n.token === address) ||
        assets?.find((item) => item.token === address)?.verified),
    [assets, bech32Prefix, nativeTokens],
  );

  return useMemo(
    () => ({
      getAsset,
      validate,
    }),
    [getAsset, validate],
  );
};

export default useAssets;
