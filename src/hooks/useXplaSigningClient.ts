import { WalletAccount } from "@interchain-kit/core";
import { useEffect, useMemo, useState } from "react";
import { MsgSend } from "@xpla/xplajs/cosmos/bank/v1beta1/tx";
import { XplaSigningClient } from "@xpla/xpla/signing-client";
import { useChain, useWalletManager } from "@interchain-kit/react";
import { toEncoders, toConverters } from "@interchainjs/cosmos/utils";
import { ICosmosGenericOfflineSigner } from "@interchainjs/cosmos/types/wallet";

const useXplaSigningClient = (chainName: string) => {
  const { rpcEndpoint, chain } = useChain(chainName);
  const [xplaClient, setXplaClient] = useState<XplaSigningClient>();
  const [account, setAccount] = useState<WalletAccount>();
  const wm = useWalletManager();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const result = await wm?.getAccount("keplr-extension", chainName);
        setAccount(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAccount();
  }, [chainName, wm]);

  const signer = useMemo(() => {
    if (!chain.chainId || !account) {
      return;
    }
    const wallet = wm.getCurrentWallet();
    console.log("wallet", wallet);
    // eslint-disable-next-line consistent-return
    return wallet.getOfflineSignerDirect(chain.chainId);
  }, [chain.chainId, account, wm]);

  const fetchClient = async (
    rpc: string,
    clientSigner: ICosmosGenericOfflineSigner,
  ) => {
    if (!rpc || !signer) {
      return;
    }
    clientSigner.signMode = "direct";
    const res = await XplaSigningClient.connectWithSigner(rpc, clientSigner);
    res.addEncoders(toEncoders(MsgSend));
    res.addConverters(toConverters(MsgSend));
    setXplaClient(res);
  };

  useEffect(() => {
    fetchClient(rpcEndpoint as string, signer);
  }, [rpcEndpoint, signer]);

  return xplaClient;
};

export default useXplaSigningClient;
