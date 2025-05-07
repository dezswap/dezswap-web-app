import { useWalletManager } from "@interchain-kit/react";
import { toEncoders } from "@interchainjs/cosmos/utils";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useQuery } from "@tanstack/react-query";
import { WalletState } from "@interchain-kit/core";
import useNetwork from "./useNetwork";

function useSigningClient() {
  const wm = useWalletManager();
  const { currentChainName, currentWalletName, getChainWalletState } = wm;
  const { chainName } = useNetwork();
  const { walletState } =
    getChainWalletState(currentWalletName, chainName) ?? {};
  const { data: signingClient } = useQuery({
    queryKey: ["signingClient", chainName],
    queryFn: async () => {
      try {
        const client = await wm.getSigningClient(currentWalletName, chainName);
        client.addEncoders(toEncoders(MsgExecuteContract));
        return client;
      } catch (err) {
        console.error("Signing client Error:", err);
        throw err;
      }
    },
    enabled:
      walletState === WalletState.Connected && chainName === currentChainName,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { signingClient };
}

export default useSigningClient;
