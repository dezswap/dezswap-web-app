import { useQuery } from "@tanstack/react-query";
import { AccAddress } from "@xpla/xpla.js";
import { useCallback, useMemo } from "react";

import useAPI from "~/hooks/useAPI";
import useCustomAssets from "~/hooks/useCustomAssets";
import useNetwork from "~/hooks/useNetwork";

import { isNativeTokenAddress } from "~/utils";

const useAssets = () => {
  const api = useAPI();
  const { chainName } = useNetwork();
  const { getCustomAsset } = useCustomAssets();
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
      (AccAddress.validate(address) ||
        isNativeTokenAddress(chainName, address) ||
        assets?.find((item) => item.token === address)?.verified),
    [assets, chainName],
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
