import { useWalletManager } from "@interchain-kit/react";
import { useChain } from "@interchain-kit/react";
import { CosmosSignArgs, toEncoders } from "@interchainjs/cosmos";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useEffect } from "react";

import {
  LegacyConnectType,
  type LegacyTxResult,
  convertCosmosArgsToTxOptions,
  useConnectedLegacyWallet,
  useLegacyWallet,
} from "~/utils/legacy";
import type { Optional, Prettify } from "~/utils/type";

import { useNetwork } from "./useNetwork";

type TxResultResult = Prettify<
  Optional<Omit<LegacyTxResult["result"], "height">, "raw_log">
>;

interface TxResult {
  success: boolean;
  result: TxResultResult;
}

interface UseConnectedWalletReturnType {
  walletAddress: string;
  connection: {
    name?: string;
    icon?: string;
  };
  connectType: LegacyConnectType;
  post: (args: CosmosSignArgs) => Promise<TxResult>;
  disconnect: () => void;
}

export const useConnectedWallet = ():
  | UseConnectedWalletReturnType
  | undefined => {
  const connectedLegacyWallet = useConnectedLegacyWallet();
  const legacyWallet = useLegacyWallet();
  const {
    currentChainName,
    currentWalletName,
    disconnect: disconnectByWalletManager,
  } = useWalletManager();

  const { chainName } = useNetwork();
  const {
    signingClient,
    address: walletAddress,
    disconnect,
    wallet: connectedWallet,
  } = useChain(chainName);

  useEffect(() => {
    signingClient?.addEncoders(toEncoders(MsgExecuteContract));
  }, [signingClient]);

  useEffect(() => {
    if (currentChainName && currentChainName !== chainName) {
      disconnectByWalletManager(currentWalletName, currentChainName);
    }
  }, [
    currentChainName,
    chainName,
    currentWalletName,
    disconnectByWalletManager,
  ]);

  if (connectedLegacyWallet) {
    return {
      ...connectedLegacyWallet,
      post: (args: CosmosSignArgs) =>
        connectedLegacyWallet.post(convertCosmosArgsToTxOptions(args)),
      disconnect: legacyWallet.disconnect,
    };
  }

  if (!connectedWallet || !signingClient) {
    return undefined;
  }

  const connection = {
    name: connectedWallet.info.prettyName,
    icon:
      typeof connectedWallet.info.logo === "string"
        ? connectedWallet.info.logo
        : connectedWallet.info.logo?.major,
  };

  const connectType =
    connectedWallet.info.mode === "wallet-connect"
      ? LegacyConnectType.WALLETCONNECT
      : LegacyConnectType.EXTENSION;

  const post = async (args: CosmosSignArgs) => {
    const postResult = await signingClient.signAndBroadcast(
      walletAddress,
      args.messages,
      args.fee ?? "auto",
      args.memo,
    );

    const txResp = await postResult.wait();

    return {
      success: txResp.code === 0,
      result: {
        txhash: postResult.transactionHash,
        raw_log: txResp.rawLog,
      },
    };
  };

  return {
    walletAddress,
    connection,
    post,
    connectType,
    disconnect,
  };
};
