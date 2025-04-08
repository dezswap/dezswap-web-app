import { useChain } from "@interchain-kit/react";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChainName } from "constants/dezswap";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { NetworkInfo } from "types/common";

const useNetwork = () => {
  const [searchParams] = useSearchParams();

  const chainName = useMemo(() => {
    return searchParams.get(CHAIN_NAME_SEARCH_PARAM) || DefaultChainName;
  }, [searchParams]);

  const { getRpcEndpoint, chain: selectedChain } = useChain(chainName);

  const network = useRef<NetworkInfo>({
    chainName,
    selectedChain,
    rpcUrl: "",
  });

  const settingNetwork = useCallback(async () => {
    const rpcUrl = await getRpcEndpoint();
    network.current = {
      chainName,
      selectedChain,
      rpcUrl,
    };
  }, [chainName, getRpcEndpoint, selectedChain]);

  useEffect(() => {
    settingNetwork();
  }, [settingNetwork]);

  return useMemo(() => network.current, [network.current]);
};

export default useNetwork;
