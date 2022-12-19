import { useCallback, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useAPI } from "hooks/useAPI";
import { useNetwork } from "hooks/useNetwork";
import assetsAtom, { verifiedAssetsAtom } from "stores/assets";
import { AccAddress } from "@xpla/xpla.js";
import { Asset, NetworkName } from "types/common";
import { isNativeTokenAddress } from "utils";
import { nativeTokens } from "constants/network";

const useAssets = () => {
  const [assetStore, setAssetStore] = useAtom(assetsAtom);
  const verifiedAssets = useAtomValue(verifiedAssetsAtom);
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
      const store = assetStore[networkName] || [];
      const address = fetchQueue.current[networkName]?.[0];

      if (address && AccAddress.validate(address)) {
        const index = store.findIndex((item) => item.address === address);
        if (index >= 0) {
          const currentAsset = store[index];
          if (
            new Date((currentAsset as Asset).updatedAt || 0)?.getTime() <
              Date.now() - 5 * 1000 &&
            window.navigator.onLine
          ) {
            const res = await api.getToken(address);
            if (res) {
              if (verifiedAssets) {
                const verifiedAsset = verifiedAssets?.[networkName]?.[address];
                store[index] = {
                  ...res,
                  address,
                  iconSrc: verifiedAsset?.icon,
                  updatedAt: new Date(),
                };
                setAssetStore((current) => ({
                  ...current,
                  [networkName]: store,
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
      if (AccAddress.validate(address)) {
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
      if (isNativeTokenAddress(address)) {
        return nativeTokens?.find((item) => item.address === address);
      }

      const asset = assetStore[network.name]?.find(
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
    [assetStore, network, addFetchQueue],
  );

  return useMemo(() => ({ getAsset }), [getAsset]);
};

export default useAssets;
