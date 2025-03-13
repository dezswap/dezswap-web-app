import { assetLists, chains } from "@chain-registry/v2";
import type { Chain, AssetList } from "@chain-registry/v2-types";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { useEffect, useMemo, useState } from "react";
import { NetworkName } from "types/common";

const useNetwork = () => {
  const wallet = useWallet();
  const xplaNetwork = useMemo(
    () => ({ ...wallet.network, name: wallet.network.name as NetworkName }),
    [wallet.network],
  );
  const [chainName, setChainName] = useState<string>("xpla");

  useEffect(() => {
    if (wallet.status === WalletStatus.WALLET_CONNECTED)
      setChainName(xplaNetwork.name === "testnet" ? "xplatestnet" : "xpla");
    else setChainName(import.meta.env?.DEV ? "xplatestnet" : "xpla");
  }, [xplaNetwork, wallet.status]);

  return useMemo(() => {
    const selectedChain =
      chains.find((chain) => chain.chainName === chainName) ?? ({} as Chain);
    const rpcUrl = selectedChain?.apis?.rpc?.[0]?.address || "";
    const chainAssetList =
      assetLists.find((assetList) => assetList.chainName === chainName) ??
      ({} as AssetList);

    return {
      chainName,
      setChainName, // Used to update wallet list that supports keplr-extension
      selectedChain,
      rpcUrl,
      chainAssetList,
    };
  }, [chainName]);
};

export default useNetwork;
