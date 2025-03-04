import { XplaSigningClient } from "@xpla/xpla/signing-client";
import { toEncoders, toConverters } from "@interchainjs/cosmos/utils";
import { useEffect, useMemo, useState } from "react";
import { MsgSend } from "@xpla/xplajs/cosmos/bank/v1beta1/tx";
import { useChain, useWalletManager } from "@interchain-kit/react";

const useXplaSigningClient = (chainName: string) => {
  const { rpcEndpoint, chain } = useChain(chainName);
  const [xplaClient, setXplaClient] = useState<XplaSigningClient>();
  const wm = useWalletManager();
  console.log(wm, wm?.getCurrentWallet);
  if (!wm?.getCurrentWallet) return;

  const signer = useMemo(() => {
    if (!chain.chainId) {
      return;
    }
    const wallet = wm.getCurrentWallet();

    return wallet.getOfflineSignerDirect(chain.chainId);
  }, [wm, chain]);

  const _fetchClient = async (rpcEndpoint: string, signer: any) => {
    if (!rpcEndpoint || !signer) {
      return;
    }
    signer.signMode = "direct";
    const res = await XplaSigningClient.connectWithSigner(rpcEndpoint, signer);
    console.log(MsgSend);
    res.addEncoders(toEncoders(MsgSend));
    res.addConverters(toConverters(MsgSend));
    setXplaClient(res);
  };

  useEffect(() => {
    _fetchClient(rpcEndpoint as string, signer);
  }, [rpcEndpoint, signer]);

  return xplaClient;
};

export default useXplaSigningClient;
