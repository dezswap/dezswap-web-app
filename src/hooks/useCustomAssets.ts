import { useCallback, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useAPI } from "hooks/useAPI";
import { useNetwork } from "hooks/useNetwork";
import {
  customAssetsAtom,
  verifiedAssetsAtom,
  verifiedIbcAssetsAtom,
} from "stores/assets";
import { AccAddress } from "@xpla/xpla.js";
import { Asset, NetworkName } from "types/common";
import { getIbcTokenHash, isNativeTokenAddress } from "utils";
import { nativeTokens } from "constants/network";

const UPDATE_INTERVAL_SEC = 5000;

const useCustomAssets = () => {
  const [customAssetStore, setCustomAssetStore] = useAtom(customAssetsAtom);
  const verifiedAssets = useAtomValue(verifiedAssetsAtom);
  const verifiedIbcAssets = useAtomValue(verifiedIbcAssetsAtom);

  const api = useAPI();
  const network = useNetwork();
  const fetchQueue = useRef<{ [K in NetworkName]?: AccAddress[] }>({
    mainnet: [],
    testnet: [],
  });
  const isFetching = useRef(false);

  const fetchAsset = useCallback(async () => {
    isFetching.current = true;
    try {
      const networkName = network.name;
      const store = customAssetStore[networkName] || [];
      const address = fetchQueue.current[networkName]?.[0];

      if (address) {
        const index = store.findIndex((item) => item.address === address);
        if (index >= 0) {
          const currentAsset = store[index];
          if (
            new Date((currentAsset as Asset).updatedAt || 0)?.getTime() <
              Date.now() - UPDATE_INTERVAL_SEC &&
            window.navigator.onLine
          ) {
            if (isNativeTokenAddress(network.name, address)) {
              const asset = nativeTokens[network.name]?.find(
                (item) => item.address === address,
              );
              const balance = await api.getNativeTokenBalance(address);
              if (asset) {
                store[index] = {
                  ...asset,
                  balance: balance || "0",
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [networkName]: customAssetStore[networkName],
                }));
              }
            } else if (
              verifiedIbcAssets?.[networkName]?.[getIbcTokenHash(address)]
            ) {
              const asset =
                verifiedIbcAssets?.[networkName]?.[getIbcTokenHash(address)];
              const balance = await api.getNativeTokenBalance(address);
              if (asset) {
                store[index] = {
                  ...asset,
                  total_supply: "",
                  address: asset.denom,
                  iconSrc: asset.icon,
                  balance: balance || "0",
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [networkName]: customAssetStore[networkName],
                }));
              }
            } else {
              const token = await api.getToken(address);
              if (verifiedAssets) {
                const verifiedAsset = verifiedAssets?.[networkName]?.[address];
                const balance = await api.getTokenBalance(address);

                store[index] = {
                  ...token,
                  address,
                  balance: balance || "0",
                  iconSrc: verifiedAsset?.icon,
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [networkName]: customAssetStore[networkName],
                }));
              } else if (!fetchQueue.current[networkName]?.includes(address)) {
                fetchQueue.current[networkName]?.push(address);
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
      fetchQueue.current[network.name]?.shift();
      if (fetchQueue.current[network.name]?.length) {
        fetchAsset();
      }
    }, 100);
  }, [network, customAssetStore, api, verifiedAssets, setCustomAssetStore]);

  const addFetchQueue = useCallback(
    (address: string, networkName: NetworkName) => {
      if (
        nativeTokens[networkName]?.some((item) => item.address === address) ||
        AccAddress.validate(address) ||
        (verifiedIbcAssets &&
          verifiedIbcAssets[networkName]?.[getIbcTokenHash(address)])
      ) {
        if (!fetchQueue.current[networkName]?.includes(address)) {
          fetchQueue.current[networkName]?.push(address);
        }
      }
      if (!isFetching.current && window.navigator.onLine) {
        fetchAsset();
      }
    },
    [fetchAsset],
  );

  const getAsset = useCallback(
    (address: string): Partial<Asset> | undefined => {
      const asset = customAssetStore[network.name]?.find(
        (item) => item.address === address,
      );
      if (!asset?.address) {
        return undefined;
      }
      if (window.navigator.onLine) {
        addFetchQueue(asset.address, network.name);
      }
      return asset;
    },
    [customAssetStore, network, addFetchQueue],
  );

  const addCustomAsset = useCallback(
    (asset: Asset) => {
      const store = customAssetStore[network.name] || [];
      const index = store.findIndex((item) => item.address === asset.address);
      if (index >= 0) {
        store[index] = asset;
      } else {
        store.push(asset);
      }
      setCustomAssetStore((current) => ({
        ...current,
        [network.name]: store,
      }));
      addFetchQueue(asset.address, network.name);
    },
    [addFetchQueue, customAssetStore, network.name, setCustomAssetStore],
  );

  return useMemo(
    () => ({
      customAssets: customAssetStore[network.name],
      addCustomAsset,
      getCustomAsset: getAsset,
    }),
    [addCustomAsset, customAssetStore, getAsset, network.name],
  );
};

export default useCustomAssets;
