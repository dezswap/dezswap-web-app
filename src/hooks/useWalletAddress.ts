import { useWalletManager } from "@interchain-kit/react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { KeplrName } from "constants/dezswap";
import { useAtom } from "jotai";
import { walletInfoAtom } from "stores/wallet";

const useWalletAddress = () => {
  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);
  const wm = useWalletManager();
  const connectedWallet = useConnectedWallet();

  const resetWalletAddress = () => {
    setWalletInfo({
      walletAddress: "",
      isKeplr: false,
    });
  };

  const fetchWalletAddress = async (chainName: string, walletName?: string) => {
    try {
      const { address } = (await wm?.getAccount(KeplrName, chainName)) ?? {};
      const isKeplr = walletName === KeplrName;
      const walletAddress = isKeplr
        ? address
        : connectedWallet?.walletAddress || "";

      setWalletInfo({
        walletAddress,
        isKeplr,
      });
    } catch (error) {
      console.error(error);
      resetWalletAddress();
    }
  };

  return {
    ...walletInfo,
    fetchWalletAddress,
    resetWalletAddress,
  };
};

export default useWalletAddress;
