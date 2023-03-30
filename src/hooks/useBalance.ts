import { useEffect, useMemo, useState } from "react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { useAPI } from "hooks/useAPI";
import { getIbcTokenHash, isNativeTokenAddress } from "utils";
import { useAtomValue } from "jotai";
import { verifiedIbcAssetsAtom } from "stores/assets";
import { useNetwork } from "hooks/useNetwork";

const UPDATE_INTERVAL = 2500;

export const useBalance = (asset: string) => {
  const connectedWallet = useConnectedWallet();
  const [balance, setBalance] = useState<string>();
  const verifiedIbcAssets = useAtomValue(verifiedIbcAssetsAtom);
  const network = useNetwork();
  const api = useAPI();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!connectedWallet?.walletAddress || !asset) {
        setBalance("0");
      }

      if (asset && connectedWallet?.network.name) {
        if (
          isNativeTokenAddress(connectedWallet?.network.name, asset) ||
          (verifiedIbcAssets &&
            !!verifiedIbcAssets[network.name]?.[getIbcTokenHash(asset)])
        ) {
          api
            .getNativeTokenBalance(asset)
            .then((value) =>
              typeof value !== "undefined"
                ? setBalance(`${value}`)
                : setBalance("0"),
            );
        } else {
          api
            .getTokenBalance(asset)
            .then((value) =>
              typeof value !== "undefined"
                ? setBalance(value)
                : setBalance("0"),
            );
        }
      }
    };

    const intervalId = setInterval(() => fetchBalance(), UPDATE_INTERVAL);
    fetchBalance();

    return () => {
      clearInterval(intervalId);
    };
  }, [api, connectedWallet, asset, verifiedIbcAssets, network.name]);

  return useMemo(() => balance, [balance]);
};
