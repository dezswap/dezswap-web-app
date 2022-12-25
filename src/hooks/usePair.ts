import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAPI } from "hooks/useAPI";
import { NetworkName } from "types/common";
import { useAtom, useSetAtom } from "jotai";
import { generatePairsMsg } from "utils/dezswap";
import pairsAtom, { isPairsLoadingAtom } from "stores/pairs";
import assetsAtom from "stores/assets";
import { useNetwork } from "hooks/useNetwork";

const LIMIT = 30;

const usePairs = () => {
  const network = useNetwork();
  const [pairs, setPairs] = useAtom(pairsAtom);
  const [isLoading, setIsLoading] = useAtom(isPairsLoadingAtom);
  const setAssets = useSetAtom(assetsAtom);
  const isMainFetcher = useRef(false);
  const api = useAPI();

  const fetchPairs = useCallback(
    async (options: Parameters<typeof generatePairsMsg>[0]) => {
      try {
        if (!network.name || !window.navigator.onLine) {
          return;
        }
        setIsLoading(true);
        const res = await api.getPairs(options);
        if (res?.pairs) {
          const newPairs = res.pairs.map((pair) => ({
            ...pair,
            asset_addresses: pair.asset_infos.map((asset) =>
              "token" in asset
                ? asset.token.contract_addr
                : asset.native_token.denom,
            ),
          }));
          if (newPairs.length) {
            setPairs((current) => {
              const currentPairs = current[network.name]?.data || [];
              return {
                ...current,
                [network.name]: {
                  data: [...currentPairs, ...newPairs].filter(
                    (pair, index, array) =>
                      index ===
                      array.findIndex(
                        (p) => p.contract_addr === pair.contract_addr,
                      ),
                  ),
                },
              };
            });
            return;
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [api, network.name, setIsLoading, setPairs],
  );

  useEffect(() => {
    if ((!isMainFetcher.current && !isLoading) || isMainFetcher.current) {
      isMainFetcher.current = true;
      const lastPair = pairs[network.name]?.data?.slice(-1)[0];
      fetchPairs({
        limit: LIMIT,
        ...(lastPair ? { start_after: lastPair.asset_infos } : undefined),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPairs, network.name, pairs]);

  const getPairedAddresses = useCallback(
    (searchAddress: string) => {
      const pairAddresses = pairs[network.name]?.data
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
    [network, pairs],
  );

  const availableAssetAddresses = useMemo(() => {
    return {
      addresses:
        pairs[network.name]?.data
          ?.reduce((acc, pair) => {
            return [...acc, ...pair.asset_addresses];
          }, [] as string[])
          ?.filter((asset, index, array) => array.indexOf(asset) === index) ||
        [],
      networkName: network.name,
    };
  }, [pairs, network.name]);

  useEffect(() => {
    if (availableAssetAddresses) {
      setAssets((current) => {
        const { addresses, networkName } = availableAssetAddresses;
        const currentAssetList = current[networkName] || [];
        return {
          ...current,
          [networkName]: [
            ...currentAssetList,
            ...addresses
              .filter(
                (address) =>
                  currentAssetList.findIndex(
                    (item) => item.address === address,
                  ) < 0,
              )
              .map((address) => ({
                address,
              })),
          ],
        };
      });
    }
  }, [availableAssetAddresses, setAssets]);

  const findPair = useCallback(
    (addresses: [string, string]) => {
      return pairs[network.name]?.data?.find(
        (pair) =>
          pair.asset_addresses.includes(addresses[0]) &&
          pair.asset_addresses.includes(addresses[1]),
      );
    },
    [network.name, pairs],
  );

  const findPairByLpAddress = useCallback(
    (lpAddress: string) => {
      return pairs[network.name]?.data?.find(
        (pair) => pair.liquidity_token === lpAddress,
      );
    },
    [network.name, pairs],
  );

  return useMemo(
    () => ({
      pairs: pairs[network.name as NetworkName]?.data,
      getPairedAddresses,
      availableAssetAddresses,
      findPair,
      findPairByLpAddress,
    }),
    [
      availableAssetAddresses,
      getPairedAddresses,
      network.name,
      pairs,
      findPair,
      findPairByLpAddress,
    ],
  );
};

export default usePairs;
