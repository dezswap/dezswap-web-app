import { useWalletManager } from "@interchain-kit/react";
import { toEncoders } from "@interchainjs/cosmos/utils";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useQuery } from "@tanstack/react-query";
import { WalletState } from "@interchain-kit/core";
import useNetwork from "./useNetwork";

function useSigningClient() {
  const {
    currentChainName,
    currentWalletName,
    getChainWalletState,
    isReady,
    getSigningClient,
  } = useWalletManager();
  const { chainName } = useNetwork();
  const { walletState } =
    getChainWalletState(currentWalletName, chainName) ?? {};
  const { data: signingClient } = useQuery({
    queryKey: [
      "signingClient",
      currentWalletName,
      walletState,
      currentChainName,
      isReady,
    ],
    queryFn: async () => {
      try {
        const client = await getSigningClient(currentWalletName, chainName);
        client.addEncoders(toEncoders(MsgExecuteContract));
        return client;
      } catch (err) {
        console.error("Signing client Error:", err);
        throw err;
      }
    },
    enabled: isReady && walletState === WalletState.Connected,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { signingClient };
}

export default useSigningClient;
