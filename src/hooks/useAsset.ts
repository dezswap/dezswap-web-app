import { useQuery } from "@tanstack/react-query";
import useAssets from "./useAssets";

const useAsset = (assetAddress: string | undefined) => {
  const { getAsset } = useAssets();

  return useQuery({
    queryKey: ["asset", assetAddress],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- assetAddress is not undefined
    queryFn: () => getAsset(assetAddress!),
    enabled: !!assetAddress,
  });
};

export default useAsset;
