import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { useQuery } from "@tanstack/react-query";
import { getAddressFromAssetInfo } from "utils/dezswap";

const usePairs = () => {
  const network = useNetwork();
  const api = useAPI();

  const { data: pairs, isLoading } = useQuery({
    queryKey: ["pairs", network.chainID],
    queryFn: async () => {
      const res = await api.getPairs();
      return res?.pairs.map((pair) => ({
        ...pair,
        asset_addresses: pair.asset_infos.map(
          (assetInfo) => getAddressFromAssetInfo(assetInfo) || "",
        ),
      }));
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  const getPairedAddresses = useCallback(
    (searchAddress: string) => {
      const pairAddresses = pairs
        ?.filter((pair) => {
          return pair.asset_addresses.includes(searchAddress);
        })
        .map((pair) => {
          return pair.asset_addresses.find(
            (address) => address !== searchAddress,
          ) as string;
        });
      return pairAddresses;
    },
    [pairs],
  );

  const availableAssetAddresses = useMemo(() => {
    return (
      pairs
        ?.reduce((acc, pair) => {
          return [...acc, ...pair.asset_addresses];
        }, [] as string[])
        ?.filter((asset, index, array) => array.indexOf(asset) === index) || []
    );
  }, [pairs]);

  const getPair = useCallback(
    (contractAddress: string) => {
      return pairs?.find((pair) => pair.contract_addr === contractAddress);
    },
    [pairs],
  );

  const findPair = useCallback(
    (addresses: [string, string]) => {
      if (addresses[0] === addresses[1]) {
        return undefined;
      }
      return pairs?.find(
        (pair) =>
          pair.asset_addresses.includes(addresses[0]) &&
          pair.asset_addresses.includes(addresses[1]),
      );
    },
    [pairs],
  );

  const findPairByLpAddress = useCallback(
    (lpAddress: string) => {
      return pairs?.find((pair) => pair.liquidity_token === lpAddress);
    },
    [pairs],
  );

  return useMemo(
    () => ({
      pairs,
      isLoading,
      getPairedAddresses,
      availableAssetAddresses,
      getPair,
      findPair,
      findPairByLpAddress,
    }),
    [
      availableAssetAddresses,
      getPairedAddresses,
      pairs,
      isLoading,
      getPair,
      findPair,
      findPairByLpAddress,
    ],
  );
};

export default usePairs;
