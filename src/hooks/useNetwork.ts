import { useChain } from "@interchain-kit/react";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChain } from "constants/dezswap";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NetworkInfo } from "types/common";

const useNetwork = () => {
  const wallet = useWallet();
  const [searchParams] = useSearchParams();

  const chainNames = DefaultChain.map((chain) => chain.chainName);

  let chainName = searchParams.get(CHAIN_NAME_SEARCH_PARAM) || chainNames[0];

  const { getRpcEndpoint, chain: selectedChain } = useChain(chainName);
  const [network, setNetwork] = useState<NetworkInfo>({
    chainName,
    selectedChain,
    rpcUrl: "",
  });

  const settingNetwork = async () => {
    const rpcUrl = await getRpcEndpoint();

    if (wallet.status === WalletStatus.WALLET_CONNECTED) {
      chainName = wallet.network.name === "testnet" ? "xplatestnet" : "xpla";
    }

    setNetwork({
      chainName,
      selectedChain,
      rpcUrl,
    });
  };

  useEffect(() => {
    settingNetwork();
  }, [chainName]);

  return useMemo(() => network, [network]);
};

export default useNetwork;
