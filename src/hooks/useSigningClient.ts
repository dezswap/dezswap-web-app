import { useWalletManager } from "@interchain-kit/react";
import { toEncoders } from "@interchainjs/cosmos/utils";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useQuery } from "@tanstack/react-query";
import { WalletState } from "@interchain-kit/core";

function useSigningClient() {
  const wm = useWalletManager();
  const { currentChainName, currentWalletName, getChainWalletState } = wm;
  const { walletState } =
    getChainWalletState(currentWalletName, currentChainName) ?? {};
  const { data: signingClient } = useQuery({
    queryKey: ["signingClient", currentChainName],
    queryFn: async () => {
      try {
        const client = await wm.getSigningClient(
          currentWalletName,
          currentChainName,
        );
        client.addEncoders(toEncoders(MsgExecuteContract));
        return client;
      } catch (err) {
        console.error("Signing client Error:", err);
        throw err;
      }
    },
    enabled: walletState === WalletState.Connected,
  });
  return { signingClient };
}

export default useSigningClient;
