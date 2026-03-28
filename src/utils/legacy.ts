import {
  MsgExecuteContract as BeforeMsgExecuteContract,
  CreateTxOptions,
} from "@xpla/xpla.js";
import { Coin, Fee } from "@xpla/xpla.js";
import type { StdFee } from "@cosmjs/stargate";
import type { EncodeObject } from "@cosmjs/proto-signing";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";

/** Local replacement for @interchainjs/cosmos CosmosSignArgs */
export interface CosmosSignArgs {
  messages: EncodeObject[];
  fee?: StdFee;
  memo?: string;
}

import { getCoins } from "./dezswap";
import { Json } from "./encode";

export {
  ConnectType as LegacyConnectType,
  type TxResult as LegacyTxResult,
  useConnectedWallet as useConnectedLegacyWallet,
  useWallet as useLegacyWallet,
} from "@xpla/wallet-provider";

export const convertCosmosArgsToTxOptions = (
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

export const convertProtoToAminoMsg = (protoMsgs: MsgExecuteContract[]) => {
  return {
    msgs: protoMsgs.map(
      (protoMsg) =>
        new BeforeMsgExecuteContract(
          protoMsg.sender,
          protoMsg.contract,
          Json.fromBytes(protoMsg.msg),
          getCoins(
            protoMsg.funds?.map((fund) => ({
              address: fund.denom,
              amount: fund.amount,
            })) || [],
          ),
        ),
    ),
  };
};

/**
 * Convert StdFee to legacy Fee from @xpla/xpla.js.
 * Used for legacy wallet-provider compatibility.
 * TODO: Remove when useRequestPost migrates away from @xpla/xpla.js Fee.
 */
export const convertStdFeeToLegacyFee = (stdFee: StdFee): Fee => {
  return new Fee(
    Number(stdFee.gas),
    stdFee.amount.map((coin) => new Coin(coin.denom, coin.amount)),
  );
};
