import { useWalletManager } from "@interchain-kit/react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { useAtom } from "jotai";
import { walletInfoAtom } from "stores/wallet";

const useWalletAddress = () => {
  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);
  const wm = useWalletManager();
  const connectedWallet = useConnectedWallet();

  const fetchWalletAddress = async (chainId = "xplatestnet") => {
    if (connectedWallet?.walletAddress) {
      setWalletInfo({
        walletAddress: connectedWallet.walletAddress,
        isKeplr: false,
      });
      return;
    }

    try {
      const { address } =
        (await wm?.getAccount("keplr-extension", chainId)) ?? {};
      setWalletInfo({
        walletAddress: address,
        isKeplr: true,
      });
    } catch (error) {
      console.error(error);
      setWalletInfo({
        walletAddress: "",
        isKeplr: false,
      });
    }
  };

  const resetWalletAddress = () => {
    setWalletInfo({
      walletAddress: "",
      isKeplr: false,
    });
  };

  return {
    ...walletInfo,
    fetchWalletAddress,
    resetWalletAddress,
  };
};

export default useWalletAddress;
