import { useCallback, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useAPI } from "hooks/useAPI";
import { useNetwork } from "hooks/useNetwork";
import assetsAtom, {
  verifiedAssetsAtom,
  verifiedIbcAssetsAtom,
} from "stores/assets";
import { AccAddress } from "@xpla/xpla.js";
import { Asset, NetworkName } from "types/common";
import { getIbcTokenHash, isNativeTokenAddress } from "utils";
import { nativeTokens } from "constants/network";
import useCustomAssets from "hooks/useCustomAssets";

const UPDATE_INTERVAL_SEC = 5000;

const useAssets = () => {
  const [assetStore, setAssetStore] = useAtom(assetsAtom);
  const verifiedAssets = useAtomValue(verifiedAssetsAtom);
  const verifiedIbcAssets = useAtomValue(verifiedIbcAssetsAtom);
  const api = useAPI();
  const network = useNetwork();
  const { getCustomAsset } = useCustomAssets();
  const fetchQueue = useRef<{ [K in NetworkName]?: AccAddress[] }>({
    mainnet: [],
    testnet: [],
  });
  const isFetching = useRef(false);

  const fetchAsset = useCallback(async () => {
    isFetching.current = true;
    try {
      const networkName = network.name;
      const store = assetStore[networkName] || [];
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
                setAssetStore((current) => ({
                  ...current,
                  [networkName]: assetStore[networkName],
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
                setAssetStore((current) => ({
                  ...current,
                  [networkName]: assetStore[networkName],
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
                setAssetStore((current) => ({
                  ...current,
                  [networkName]: assetStore[networkName],
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
  }, [network, assetStore, api, verifiedAssets, setAssetStore]);

  const addFetchQueue = useCallback(
    (address: string, networkName: NetworkName) => {
      if (
        nativeTokens[networkName]?.some((item) => item.address === address) ||
        AccAddress.validate(address) ||
        (verifiedIbcAssets &&
          !!verifiedIbcAssets[networkName]?.[getIbcTokenHash(address)])
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
      const asset = assetStore[network.name]?.find(
        (item) => item.address === address,
      );
      if (!asset?.address) {
        return getCustomAsset(address);
      }
      if (window.navigator.onLine) {
        addFetchQueue(asset.address, network.name);
      }
      return asset;
    },
    [assetStore, network.name, getCustomAsset, addFetchQueue],
  );

  return useMemo(
    () => ({
      getAsset,
      verifiedAssets: verifiedAssets?.[network.name],
      verifiedIbcAssets: verifiedIbcAssets?.[network.name],
    }),
    [getAsset, network.name, verifiedAssets, verifiedIbcAssets],
  );
};

export default useAssets;
