import type { CosmosMessage } from "@interchainjs/cosmos";
import { SignMode } from "@xpla/xplajs/cosmos/tx/signing/v1beta1/signing";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  Tx,
  TxBody,
} from "@xpla/xplajs/cosmos/tx/v1beta1/tx";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import type { Any } from "@xpla/xplajs/google/protobuf/any";

import type { JsonObject } from "./type";

export const toUtf8 = (query: JsonObject) => {
  return new TextEncoder().encode(JSON.stringify(query));
};

export const parseJsonFromUtf8 = (binaryData: Uint8Array) =>
  JSON.parse(new TextDecoder().decode(binaryData));

export const toAny = (msgs: MsgExecuteContract[]): Any[] =>
  msgs.map((msg) => ({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.encode(msg).finish(),
  }));

export const toCosmosMessages = (msgs: MsgExecuteContract[]): CosmosMessage[] =>
  msgs.map((msg) => ({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract" as const,
    value: msg,
  }));

export const encodeTx = (messages: Any[], authSequence: bigint): Uint8Array => {
  const txBody = TxBody.fromPartial({
    messages,
  });

  const signerInfo = SignerInfo.fromPartial({
    sequence: authSequence,
    modeInfo: { single: { mode: SignMode.SIGN_MODE_UNSPECIFIED } },
  });

  const tx = Tx.fromPartial({
    body: txBody,
    authInfo: AuthInfo.fromPartial({
      signerInfos: [signerInfo],
      fee: Fee.fromPartial({}),
    }),
    signatures: [new Uint8Array()],
  });

  return Tx.encode(tx).finish();
};

export const toBase64 = (msg: JsonObject) => window.btoa(JSON.stringify(msg));
