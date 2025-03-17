import { useWalletManager } from "@interchain-kit/react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { walletInfoAtom } from "stores/wallet";
import useNetwork from "./useNetwork";

const useWalletAddress = () => {
  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);
  const wm = useWalletManager();
  const connectedWallet = useConnectedWallet();
  const {
    selectedChain: { chainName },
  } = useNetwork();

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
        if (!connectedWallet) {
          resetWalletAddress();
          return;
        }
        setWalletInfo({
          walletAddress: connectedWallet.walletAddress,
          isInterchain,
        });
      }
    } catch (error) {
      console.error(error);
      resetWalletAddress();
    }
  }, [wm, chainName, setWalletInfo, connectedWallet, resetWalletAddress]);

  useEffect(() => {
    fetchWalletAddress();
  }, [fetchWalletAddress]);

  return useMemo(
    () => ({
      ...walletInfo,
      fetchWalletAddress,
      resetWalletAddress,
    }),
    [walletInfo, fetchWalletAddress, resetWalletAddress],
  );
};

export default useWalletAddress;
