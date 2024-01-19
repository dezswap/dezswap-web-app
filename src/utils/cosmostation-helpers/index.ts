import {
  Msg,
  SignAminoDoc,
} from "@cosmostation/extension-client/types/message";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { PubKey as Secp256k1PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { Any as ProtobufAny } from "cosmjs-types/google/protobuf/any";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { BroadcastMode } from "cosmjs-types/cosmos/tx/v1beta1/service";

export type ProtoTxBytesProps = {
  signature: string;
  txBodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
};

export function isAminoExecuteContract(
  msg: Msg,
): msg is Msg<MsgExecuteContract> {
  return msg.type === "wasm/MsgExecuteContract";
}

export function convertAminoExecuteContractMessageToProto(
  msg: Msg<MsgExecuteContract>,
) {
  const message = MsgExecuteContract.fromPartial({
    sender: msg.value.sender,
    contract: msg.value.contract,
    funds: msg.value.funds,
    msg: Buffer.from(JSON.stringify(msg.value.msg)),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ProtobufAny.fromPartial<any>({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.encode(message).finish(),
  });
}

export function convertAminoMessageToProto(msg: Msg) {
  if (isAminoExecuteContract(msg)) {
    return convertAminoExecuteContractMessageToProto(msg);
  }

  // TODO
  // if (isAminoSend(msg)) {
  //   return convertAminoSendMessageToProto(msg);
  // }

  // if (isAminoIBCSend(msg)) {
  //   return convertIBCAminoSendMessageToProto(msg);
  // }

  // if (isAminoReward(msg)) {
  //   return convertAminoRewardMessageToProto(msg);
  // }

  // if (isAminoCommission(msg)) {
  //   return convertAminoCommissionMessageToProto(msg);
  // }

  // if (isAminoSwapExactAmountIn(msg)) {
  //   return convertAminoSwapExactAmmountInMessageToProto(msg);
  // }

  return null;
}

export function protoTxBytes({
  signature,
  txBodyBytes: bodyBytes,
  authInfoBytes,
}: ProtoTxBytesProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txRaw = TxRaw.fromPartial<any>({
    bodyBytes,
    authInfoBytes,
    signatures: [Buffer.from(signature, "base64")],
  });
  const txRawBytes = TxRaw.encode(txRaw).finish();

  const tx = {
    tx_bytes: Buffer.from(txRawBytes).toString("base64"),
    mode: BroadcastMode.BROADCAST_MODE_SYNC,
  };

  return tx;
}

export function getTxBodyBytes(signed: SignAminoDoc) {
  const messages = signed.msgs
    .map((msg) => convertAminoMessageToProto(msg))
    .filter((item) => item !== null) as ProtobufAny[];

  const txBody = TxBody.fromPartial({
    messages,
    memo: signed.memo,
  });

  if (signed.msgs.length !== messages.length) {
    return null;
  }

  return TxBody.encode(txBody).finish();
}

// export function getPubKey(pubKey: PubKey) {
//   const bufferPubKey = Buffer.from(pubKey.value, "base64");
//   const publicKey = new cosmos.crypto.secp256k1.PubKey({ key: bufferPubKey });
//   return publicKey;
// }

export function getSignerInfo(
  signed: SignAminoDoc,
  pubKey: Uint8Array,
  mode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
) {
  const publicKey = Secp256k1PubKey.fromPartial({ key: pubKey });

  // TODO
  // const typeUrl = (() => {
  //   // if (pubKey.type === "ethermint/PubKeyEthSecp256k1") {
  //   //   return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
  //   // }

  //   // if (pubKey.type === "injective/PubKeyEthSecp256k1") {
  //   //   return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
  //   // }

  //   // return "/cosmos.crypto.secp256k1.PubKey";

  //   return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
  // })();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SignerInfo.fromPartial<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publicKey: ProtobufAny.fromPartial<any>({
      typeUrl: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
      value: Secp256k1PubKey.encode(publicKey).finish(),
    }),
    modeInfo: {
      single: {
        mode,
      },
    },
    sequence: Number(signed.sequence),
  });
}

export function getAuthInfoBytes(
  signed: SignAminoDoc,
  pubKey: Uint8Array,
  mode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
) {
  const signerInfo = getSignerInfo(signed, pubKey, mode);

  const fee = Fee.fromPartial({
    amount: signed.fee.amount,
    gasLimit: Number(signed.fee.gas),
  });

  const authInfo = AuthInfo.fromPartial({
    signerInfos: [signerInfo],
    fee,
  });

  return AuthInfo.encode(authInfo).finish();
}
