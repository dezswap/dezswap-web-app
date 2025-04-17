import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreateTxOptions } from "@xpla/xpla.js";
import { useWalletManager } from "@interchain-kit/react";
import { WalletState } from "@interchain-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
  useConnectedWallet as useConnectedXplaWallet,
  WalletApp,
} from "@xpla/wallet-provider";
import useNetwork from "./useNetwork";

const useConnectedWallet = () => {
  const wm = useWalletManager();
  const connectedXplaWallet = useConnectedXplaWallet();
  const { chainName } = useNetwork();
  const resetWalletValue = {
    walletAddress: "",
    isInterchain: false,
  };

  const fetchWalletAddress = useCallback(async () => {
    const { currentWalletName, currentChainName } = wm;
    const { walletState } =
      wm.getChainWalletState(currentWalletName, chainName) ?? {};

    try {
      if (currentChainName && currentChainName !== chainName) {
        wm.disconnect(currentWalletName, currentChainName);
      }
      if (walletState === WalletState.Connected) {
        const { address } =
          (await wm?.getAccount(currentWalletName, chainName)) ?? {};
        return {
          walletAddress: address,
          isInterchain: true,
        };
      }
      if (connectedXplaWallet?.walletAddress) {
        return {
          walletAddress: connectedXplaWallet.walletAddress,
          isInterchain: false,
        };
      }

      return resetWalletValue;
    } catch (error) {
      console.error(error);
      return resetWalletValue;
    }
  }, [chainName, connectedXplaWallet?.walletAddress, resetWalletValue, wm]);

  const { data: walletAddressResult } = useQuery({
    queryKey: [
      "walletAddress",
      chainName,
      wm.currentWalletName,
      connectedXplaWallet?.connectType,
    ],
    queryFn: async () => {
      return fetchWalletAddress();
    },
  });

  const prevDataString = useRef("");

  const [walletInfo, setWalletInfo] = useState(resetWalletValue);
  const post = useCallback(
    (tx: CreateTxOptions, walletApp?: WalletApp | boolean) => {
      if (walletInfo.isInterchain)
        throw new Error(`we can't use other wallets post`);
      return connectedXplaWallet?.post(tx, walletApp);
    },
    [connectedXplaWallet, walletInfo.isInterchain],
  );

  const availablePost = useMemo(
    () =>
      walletInfo.isInterchain ? false : connectedXplaWallet?.availablePost,
    // TODO: Implement with XplaSingingClient
    [connectedXplaWallet?.availablePost, walletInfo.isInterchain],
  );

  const connectType = useMemo(
    () =>
      walletInfo.isInterchain ? undefined : connectedXplaWallet?.connectType,
    // TODO: Implement with XplaSingingClient
    [connectedXplaWallet?.connectType, walletInfo.isInterchain],
  );

  const connection = useMemo(
    () =>
      walletInfo.isInterchain ? undefined : connectedXplaWallet?.connection,
    // TODO: Implement with XplaSingingClient
    [connectedXplaWallet?.connection, walletInfo.isInterchain],
  );

  useEffect(() => {
    if (prevDataString.current !== JSON.stringify(walletAddressResult)) {
      prevDataString.current = JSON.stringify(walletAddressResult);
      setWalletInfo((prevData) => ({ ...prevData, ...walletAddressResult }));
    }
  }, [walletAddressResult]);

  return useMemo(
    () => ({
      ...walletInfo,
      post,
      availablePost,
      connectType,
      connection,
    }),
    [walletInfo, post, availablePost, connectType, connection],
  );
};

export default useConnectedWallet;
