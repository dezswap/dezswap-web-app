import { useEffect, useState } from "react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { useAPI } from "hooks/useAPI";
import { isNativeTokenAddress } from "utils/dezswap";

export const useBalance = (asset: string) => {
  const connectedWallet = useConnectedWallet();
  const [balance, setBalance] = useState<string>();
  const api = useAPI();

  useEffect(() => {
    let isAborted = false;
    if (!connectedWallet?.walletAddress || !asset) {
      setBalance("0");
    }

    if (asset) {
      if (isNativeTokenAddress(asset)) {
        api
          .getNativeTokenBalance(asset)
          .then((value) =>
            typeof value !== "undefined" && !isAborted
              ? setBalance(`${value}`)
              : setBalance("0"),
          );
      } else {
        api
          .getTokenBalance(asset)
          .then((value) =>
            typeof value !== "undefined" && !isAborted
              ? setBalance(value)
              : setBalance("0"),
          );
      }
    }

    return () => {
      isAborted = true;
    };
  }, [api, connectedWallet, asset]);

  return balance;
};
