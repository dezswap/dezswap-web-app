import { useWalletManager } from "@interchain-kit/react";
import { CosmosSignArgs, toEncoders } from "@interchainjs/cosmos";
import {
  ConnectType,
  // WalletApp,
  TxResult as XplaTxResult,
  useConnectedWallet as useConnectedXplaWallet,
  useWallet as useXplaWallet,
} from "@xpla/wallet-provider";
import { CreateTxOptions } from "@xpla/xpla.js";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useEffect } from "react";

import { convertProtoToAminoMsg } from "~/utils/dezswap";
import { convertStdFeeToLegacyFee } from "~/utils/fee";
import type { Optional, Prettify } from "~/utils/type";

import { useChain } from "./useChain";
import useNetwork from "./useNetwork";

type TxResultResult = Prettify<
  Optional<Omit<XplaTxResult["result"], "height">, "raw_log">
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
  connectType: ConnectType;
  post: (args: CosmosSignArgs) => Promise<TxResult>;
  disconnect: () => void;
}

const convertCosmosArgsToTxOptions = (
  args: CosmosSignArgs,
): CreateTxOptions => {
  const { messages, fee, memo } = args;

  const protoMsgs = messages.map((msg) => {
    if (msg.typeUrl !== "/cosmwasm.wasm.v1.MsgExecuteContract") {
      throw new Error("Only MsgExecuteContract is supported");
    }
    return MsgExecuteContract.fromPartial(msg.value as MsgExecuteContract);
  });

  const { msgs } = convertProtoToAminoMsg(protoMsgs);

  return {
    msgs,
    fee: fee ? convertStdFeeToLegacyFee(fee) : undefined,
    memo,
  };
};

export const useConnectedWallet = ():
  | UseConnectedWalletReturnType
  | undefined => {
  const connectedXplaWallet = useConnectedXplaWallet();
  const xplaWallet = useXplaWallet();
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

  if (connectedXplaWallet) {
    return {
      ...connectedXplaWallet,
      post: (args: CosmosSignArgs) =>
        connectedXplaWallet.post(convertCosmosArgsToTxOptions(args)),
      disconnect: xplaWallet.disconnect,
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
      ? ConnectType.WALLETCONNECT
      : ConnectType.EXTENSION;

  const post = async (args: CosmosSignArgs) => {
    const postResult = await signingClient.signAndBroadcast(args);

    return {
      success:
        "code" in postResult.broadcastResponse &&
        postResult.broadcastResponse.code === 0,
      result: {
        txhash: postResult.transactionHash,
        raw_log:
          "log" in postResult.broadcastResponse
            ? postResult.broadcastResponse.log
            : undefined,
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
