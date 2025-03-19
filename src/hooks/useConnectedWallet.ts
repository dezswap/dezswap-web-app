import { CreateTxOptions } from "@xpla/xpla.js";
import { useWalletManager } from "@interchain-kit/react";
import {
  useConnectedWallet as useConnectedXplaWallet,
  WalletApp,
} from "@xpla/wallet-provider";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { walletInfoAtom } from "stores/wallet";
import useNetwork from "./useNetwork";

const useConnectedWallet = () => {
  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);
  const wm = useWalletManager();
  const connectedXplaWallet = useConnectedXplaWallet();
  const { chainName } = useNetwork();

  const resetWalletAddress = useCallback(() => {
    setWalletInfo({
      walletAddress: "",
      isInterchain: false,
    });
  }, [setWalletInfo]);

  const fetchWalletAddress = useCallback(async () => {
    try {
      const walletName = wm.currentWalletName;
      const isInterchain = walletName
        ? wm.isWalletConnected(walletName)
        : false;

      if (isInterchain) {
        const { address } =
          (await wm?.getAccount(walletName as string, chainName)) ?? {};

        setWalletInfo({
          walletAddress: address,
          isInterchain,
        });
      } else {
        if (!connectedXplaWallet) {
          resetWalletAddress();
          return;
        }
        setWalletInfo({
          walletAddress: connectedXplaWallet.walletAddress,
          isInterchain,
        });
      }
    } catch (error) {
      console.error(error);
      resetWalletAddress();
    }
  }, [wm, chainName, setWalletInfo, connectedXplaWallet, resetWalletAddress]);

  const post = useCallback(
    (tx: CreateTxOptions, walletApp?: WalletApp | boolean) => {
      if (walletInfo.isInterchain) return `we can't use other wallets post`; // TODO: Implement with XplaSingingClient
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
    fetchWalletAddress();
  }, [fetchWalletAddress]);

  return useMemo(
    () => ({
      ...walletInfo,
      fetchWalletAddress,
      resetWalletAddress,
      post,
      availablePost,
      connectType,
      connection,
    }),
    [
      walletInfo,
      fetchWalletAddress,
      resetWalletAddress,
      post,
      availablePost,
      connectType,
      connection,
    ],
  );
};

export default useConnectedWallet;
