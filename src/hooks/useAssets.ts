import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useAPI } from "hooks/useAPI";
import { useNetwork } from "hooks/useNetwork";
import assetsAtom, { verifiedAssetsAtom } from "stores/assets";
import { AccAddress } from "@xpla/xpla.js";
import { Asset } from "types/common";
import { isNativeTokenAddress } from "utils";
import { nativeTokens } from "constants/network";

const useAssets = () => {
  const [assetStore, setAssetStore] = useAtom(assetsAtom);
  const verifiedAssets = useAtomValue(verifiedAssetsAtom);
  const api = useAPI();
  const network = useNetwork();
  const assets = useMemo(
    () => assetStore[network.name],
    [assetStore, network.name],
  );

  const assetsRef = useRef<typeof assets>(undefined);
  const fetchQueue = useRef<AccAddress[]>([]);
  const isFetching = useRef(false);

  const fetchAsset = useCallback(async () => {
    isFetching.current = true;
    try {
      const address = fetchQueue.current[0];
      if (address && AccAddress.validate(address)) {
        if (assetsRef.current) {
          const index = assetsRef.current.findIndex(
            (item) => item.address === address,
          );
          if (index >= 0) {
            const currentAsset = assetsRef.current[index];
            if (
              new Date((currentAsset as Asset).updatedAt || 0)?.getTime() <
                Date.now() - 5 * 1000 &&
              window.navigator.onLine
            ) {
              const res = await api.getToken(address);
              if (res) {
                if (verifiedAssets) {
                  const verifiedAsset =
                    verifiedAssets?.[network.name]?.[address];
                  assetsRef.current[index] = {
                    ...res,
                    address,
                    iconSrc: verifiedAsset?.icon,
                    updatedAt: new Date(),
                  };
                  setAssetStore((current) => ({
                    ...current,
                    [network.name]: assetsRef.current,
                  }));
                } else if (!fetchQueue.current.includes(address)) {
                  fetchQueue.current.push(address);
                }
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
      fetchQueue.current.shift();
      if (fetchQueue.current.length) {
        fetchAsset();
      }
    }, 100);
  }, [api, verifiedAssets, network.name, setAssetStore]);

  const addFetchQueue = useCallback(
    (address: string) => {
      if (AccAddress.validate(address)) {
        if (assetsRef.current) {
          if (!fetchQueue.current.includes(address)) {
            fetchQueue.current.push(address);
          }
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

      const asset = assets?.find((item) => item.address === address);
      if (!asset?.address) {
        return undefined;
      }
      if (window.navigator.onLine) {
        addFetchQueue(asset.address);
      }
      return asset;
    },
    [assets, network, addFetchQueue],
  );

  useEffect(() => {
    if (assets) {
      assetsRef.current = assets;
    }
  }, [assets]);

  return useMemo(() => ({ assets, getAsset }), [assets, getAsset]);
};

export default useAssets;
