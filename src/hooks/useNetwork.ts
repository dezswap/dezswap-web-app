import { useChain } from "@interchain-kit/react";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { DefaultChain } from "constants/dezswap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NetworkInfo } from "types/common";

const useNetwork = () => {
  const [network, setNetwork] = useState<NetworkInfo>({
    chainName: "xpla",
    selectedChain: DefaultChain[0],
    rpcUrl: "",
  });
  const wallet = useWallet();
  const { getRpcEndpoint, chain } = useChain(network.chainName);
  const xplaNetwork = useMemo(
    () => ({ ...wallet.network, name: wallet.network.name }),
    [wallet.network],
  );

  const setChainName = useCallback((chainName: string) => {
    setNetwork((prev) => ({ ...prev, chainName }));
  }, []);

  useEffect(() => {
    let chainName = "xpla";

    if (wallet.status === WalletStatus.WALLET_CONNECTED) {
      chainName = xplaNetwork.name === "testnet" ? "xplatestnet" : "xpla";
    } else {
      chainName = import.meta.env?.DEV ? "xplatestnet" : "xpla";
    }

    const settingNetwork = async () => {
      const rpcUrl = await getRpcEndpoint();
      setNetwork({
        chainName,
        selectedChain: chain,
        rpcUrl,
      });
    };
    settingNetwork();
  }, [xplaNetwork, wallet.status, getRpcEndpoint, chain]);

  return useMemo(
    () => ({
      ...network,
      setChainName,
    }),
    [network, setChainName],
  );
};

export default useNetwork;
