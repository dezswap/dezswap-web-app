import { useChain } from "@interchain-kit/react";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChainName } from "constants/dezswap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NetworkInfo } from "types/common";

const useNetwork = () => {
  const wallet = useWallet();
  const [searchParams] = useSearchParams();

  const chainName = useMemo(() => {
    if (wallet.status === WalletStatus.WALLET_CONNECTED) {
      return wallet.network.name === "testnet" ? "xplatestnet" : "xpla";
    }

    return searchParams.get(CHAIN_NAME_SEARCH_PARAM) || DefaultChainName;
  }, [searchParams, wallet.network.name, wallet.status]);

  const { getRpcEndpoint, chain: selectedChain } = useChain(chainName);
  const [network, setNetwork] = useState<NetworkInfo>({
    chainName,
    selectedChain,
    rpcUrl: "",
  });

  const settingNetwork = useCallback(async () => {
    const rpcUrl = await getRpcEndpoint();

    setNetwork({
      chainName,
      selectedChain,
      rpcUrl,
    });
  }, [chainName, getRpcEndpoint, selectedChain]);

  useEffect(() => {
    settingNetwork();
  }, [settingNetwork]);

  return useMemo(() => network, [network]);
};

export default useNetwork;
