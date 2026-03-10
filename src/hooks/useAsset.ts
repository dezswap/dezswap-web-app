import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import useAssets from "./useAssets";

const useAsset = (assetAddress: string | undefined) => {
  const { assetInfos, getAsset } = useAssets();
  const asset = assetAddress ? assetInfos?.[assetAddress] : undefined;

  useEffect(() => {
    if (!assetAddress || asset) return;
    getAsset(assetAddress).catch(() => undefined);
  }, [assetAddress, asset, getAsset]);

  return useQuery({
    queryKey: ["asset", assetAddress, asset],
    queryFn: () => asset,
    enabled: !!assetAddress,
  });
};

export default useAsset;
