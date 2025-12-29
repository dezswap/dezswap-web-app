import { AccAddress } from "@xpla/xpla.js";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { nativeTokens } from "~/constants/network";

import useNetwork from "~/hooks/useNetwork";

import { customAssetsAtom } from "~/stores/assets";

import { Token } from "~/types/api";
import { TokenInfo } from "~/types/token";

import { getIbcTokenHash, isNativeTokenAddress } from "~/utils";
import { getQueryData, parseJsonFromBinary } from "~/utils/dezswap";

import usePairs from "./usePairs";
import useRPCClient from "./useRPCClient";
import useVerifiedAssets from "./useVerifiedAssets";

const UPDATE_INTERVAL_SEC = 5000;

const useCustomAssets = () => {
  const [customAssetStore, setCustomAssetStore] = useAtom(customAssetsAtom);
  const { verifiedAssets, verifiedIbcAssets } = useVerifiedAssets();
  const { availableAssetAddresses } = usePairs();

  const { client } = useRPCClient();
  const {
    chainName,
    selectedChain: { chainId },
  } = useNetwork();
  const fetchQueue = useRef<{ [K in string]?: AccAddress[] }>({
    xpla: [],
    xplatestnet: [],
  });
  const isFetching = useRef(false);

  const fetchAsset = useCallback(async () => {
    isFetching.current = true;
    try {
      const store = customAssetStore[chainName] || [];
      const address = fetchQueue.current[chainName]?.[0];

      if (address) {
        const index = store.findIndex((item) => item.token === address);
        if (index >= 0) {
          const currentAsset = store[index];
          if (
            new Date(currentAsset.updatedAt || 0)?.getTime() <
              Date.now() - UPDATE_INTERVAL_SEC &&
            window.navigator.onLine
          ) {
            if (isNativeTokenAddress(chainName, address)) {
              const asset = nativeTokens[chainName]?.find(
                (item) => item.token === address,
              );
              if (asset) {
                store[index] = {
                  ...asset,
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [chainName]: customAssetStore[chainName],
                }));
              }
            } else if (verifiedIbcAssets?.[getIbcTokenHash(address)]) {
              const asset = verifiedIbcAssets?.[getIbcTokenHash(address)];
              if (asset) {
                store[index] = {
                  ...asset,
                  total_supply: "",
                  token: asset.denom,
                  icon: asset.icon,
                  chainId: chainId ?? "",
                  protocol: "",
                  verified: true,
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [chainName]: customAssetStore[chainName],
                }));
              }
            } else {
              const queryData = getQueryData({
                token_info: {},
              });
              if (!client) {
                console.log("Error: RPCClient is not exist");
                return;
              }

              const { data } = await client.cosmwasm.wasm.v1.smartContractState(
                {
                  address,
                  queryData,
                },
              );

              const token = parseJsonFromBinary(data) as unknown as TokenInfo;

              if (verifiedAssets) {
                const verifiedAsset = verifiedAssets?.[address];

                store[index] = {
                  name: token.name,
                  decimals: token.decimals,
                  symbol: token.symbol,
                  chainId: chainId ?? "",
                  protocol: "",
                  verified: !!verifiedAsset,
                  token: address,
                  total_supply: "",
                  icon: verifiedAsset?.icon || "",
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [chainName]: customAssetStore[chainName],
                }));
              } else if (!fetchQueue.current[chainName]?.includes(address)) {
                fetchQueue.current[chainName]?.push(address);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    isFetching.current = false;
    setTimeout(() => {
      fetchQueue.current[chainName]?.shift();
      if (fetchQueue.current[chainName]?.length) {
        fetchAsset();
      }
    }, 100);
  }, [
    chainName,
    chainId,
    customAssetStore,
    verifiedIbcAssets,
    setCustomAssetStore,
    client,
    verifiedAssets,
  ]);

  const addFetchQueue = useCallback(
    (address: string, networkName: string) => {
      if (
        nativeTokens[networkName]?.some((item) => item.token === address) ||
        AccAddress.validate(address) ||
        (verifiedIbcAssets && verifiedIbcAssets?.[getIbcTokenHash(address)])
      ) {
        if (!fetchQueue.current[networkName]?.includes(address)) {
          fetchQueue.current[networkName]?.push(address);
        }
      }
      if (!isFetching.current && window.navigator.onLine) {
        fetchAsset();
      }
    },
    [fetchAsset, verifiedIbcAssets],
  );

  const getAsset = useCallback(
    (address: string): Partial<Token> | undefined => {
      const asset = customAssetStore[chainName]?.find(
        (item) => item.token === address,
      );
      if (!asset?.token) {
        return undefined;
      }
      if (window.navigator.onLine) {
        addFetchQueue(asset.token, chainName);
      }
      return asset;
    },
    [customAssetStore, chainName, addFetchQueue],
  );

  const addCustomAsset = useCallback(
    (asset: Token) => {
      const store = customAssetStore[chainName] || [];
      const index = store.findIndex((item) => item.token === asset.token);
      if (index >= 0) {
        store[index] = asset;
      } else {
        store.push(asset);
      }
      setCustomAssetStore((current) => ({
        ...current,
        [chainName]: store,
      }));
      addFetchQueue(asset.token, chainName);
    },
    [addFetchQueue, customAssetStore, chainName, setCustomAssetStore],
  );

  const removeCustomAsset = useCallback(
    (address: string) => {
      if (customAssetStore[chainName]?.some((a) => a.token === address)) {
        setCustomAssetStore((current) => ({
          ...current,
          [chainName]: customAssetStore[chainName]?.filter(
            (a) => a.token !== address,
          ),
        }));
      }
    },
    [customAssetStore, chainName, setCustomAssetStore],
  );

  useEffect(() => {
    availableAssetAddresses.forEach((address) => {
      removeCustomAsset(address);
    });
  }, [availableAssetAddresses, removeCustomAsset]);

  return useMemo(
    () => ({
      customAssets: customAssetStore[chainName],
      addCustomAsset,
      removeCustomAsset,
      getCustomAsset: getAsset,
    }),
    [addCustomAsset, customAssetStore, getAsset, chainName, removeCustomAsset],
  );
};

export default useCustomAssets;
