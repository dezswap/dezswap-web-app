import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import useNetwork from "hooks/useNetwork";
import { customAssetsAtom } from "stores/assets";
import { AccAddress } from "@xpla/xpla.js";
import { NetworkName } from "types/common";
import { getIbcTokenHash, isNativeTokenAddress } from "utils";
import { nativeTokens } from "constants/network";
import { Token } from "types/api";
import { TokenInfo } from "types/token";
import useLCDClient from "./useUpdatedLCDClient";
import usePairs from "./usePairs";
import useVerifiedAssets from "./useVerifiedAssets";
import { getQueryData } from "utils/dezswap";

const UPDATE_INTERVAL_SEC = 5000;

const useCustomAssets = () => {
  const [customAssetStore, setCustomAssetStore] = useAtom(customAssetsAtom);
  const { verifiedAssets, verifiedIbcAssets } = useVerifiedAssets();
  const { availableAssetAddresses } = usePairs();

  const { client: lcd } = useLCDClient();
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
        const index = store.findIndex((item) => item.token === address);
        if (index >= 0) {
          const currentAsset = store[index];
          if (
            new Date(currentAsset.updatedAt || 0)?.getTime() <
              Date.now() - UPDATE_INTERVAL_SEC &&
            window.navigator.onLine
          ) {
            if (isNativeTokenAddress(network.name, address)) {
              const asset = nativeTokens[network.name]?.find(
                (item) => item.token === address,
              );
              if (asset) {
                store[index] = {
                  ...asset,
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [networkName]: customAssetStore[networkName],
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
                  chainId: network.chainID,
                  protocol: "",
                  verified: true,
                  updatedAt: new Date(),
                };
                setCustomAssetStore((current) => ({
                  ...current,
                  [networkName]: customAssetStore[networkName],
                }));
              }
            } else {
              const queryData = getQueryData({
                token_info: {},
              });
              if (!lcd) {
                console.log("Error: LCDClient is not exist");
                return;
              }
              const { data } = await lcd.cosmwasm.wasm.v1.smartContractState({
                address,
                queryData,
              });
              const token = data as unknown as TokenInfo;

              if (verifiedAssets) {
                const verifiedAsset = verifiedAssets?.[address];

                store[index] = {
                  name: token.name,
                  decimals: token.decimals,
                  symbol: token.symbol,
                  chainId: network.chainID,
                  protocol: "",
                  verified: !!verifiedAsset,
                  token: address,
                  total_supply: "",
                  icon: verifiedAsset?.icon || "",
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
  }, [
    network,
    customAssetStore,
    verifiedIbcAssets,
    setCustomAssetStore,
    lcd,
    verifiedAssets,
  ]);

  const addFetchQueue = useCallback(
    (address: string, networkName: NetworkName) => {
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
      const asset = customAssetStore[network.name]?.find(
        (item) => item.token === address,
      );
      if (!asset?.token) {
        return undefined;
      }
      if (window.navigator.onLine) {
        addFetchQueue(asset.token, network.name);
      }
      return asset;
    },
    [customAssetStore, network, addFetchQueue],
  );

  const addCustomAsset = useCallback(
    (asset: Token) => {
      const store = customAssetStore[network.name] || [];
      const index = store.findIndex((item) => item.token === asset.token);
      if (index >= 0) {
        store[index] = asset;
      } else {
        store.push(asset);
      }
      setCustomAssetStore((current) => ({
        ...current,
        [network.name]: store,
      }));
      addFetchQueue(asset.token, network.name);
    },
    [addFetchQueue, customAssetStore, network.name, setCustomAssetStore],
  );

  const removeCustomAsset = useCallback(
    (address: string) => {
      if (customAssetStore[network.name]?.some((a) => a.token === address)) {
        setCustomAssetStore((current) => ({
          ...current,
          [network.name]: customAssetStore[network.name]?.filter(
            (a) => a.token !== address,
          ),
        }));
      }
    },
    [customAssetStore, network.name, setCustomAssetStore],
  );

  useEffect(() => {
    availableAssetAddresses.forEach((address) => {
      removeCustomAsset(address);
    });
  }, [availableAssetAddresses, removeCustomAsset]);

  return useMemo(
    () => ({
      customAssets: customAssetStore[network.name],
      addCustomAsset,
      removeCustomAsset,
      getCustomAsset: getAsset,
    }),
    [
      addCustomAsset,
      customAssetStore,
      getAsset,
      network.name,
      removeCustomAsset,
    ],
  );
};

export default useCustomAssets;
