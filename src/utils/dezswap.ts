import {
  AccAddress,
  Coin,
  Coins,
  MsgExecuteContract as BeforeMsgExecuteContract,
  Numeric,
} from "@xpla/xpla.js";
import { Asset, NativeAsset } from "types/pair";
import { contractAddresses } from "constants/dezswap";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { MessageComposer } from "@xpla/xplajs/cosmwasm/wasm/v1/tx.registry";
import { AssetInfo } from "types/api";
import { Buffer } from "buffer";
import { toUtf8 } from "@cosmjs/encoding";
import {
  TxBody,
  SignerInfo,
  Tx,
  AuthInfo,
  Fee,
} from "@xpla/xplajs/cosmos/tx/v1beta1/tx";
import { SignMode } from "@xpla/xplajs/cosmos/tx/signing/v1beta1/signing";

export type Amount = string | number;

export const queryMessages = {
  getPairs(
    options: {
      limit?: number;
      start_after?: [Asset | NativeAsset, Asset | NativeAsset];
    } = {},
  ) {
    return {
      pairs: options,
    };
  },
  getPool() {
    return { pool: {} };
  },
};

export const getQueryData = (query: object) => {
  return new Uint8Array(Buffer.from(JSON.stringify(query)));
};

export const parseJsonFromBinary = (binaryData: Uint8Array) =>
  JSON.parse(new TextDecoder().decode(binaryData));

export const createEncodedTx = (
  msgs: MsgExecuteContract[],
  authSequence: bigint,
): Uint8Array => {
  const { executeContract } = MessageComposer.encoded;
  const messages = msgs.map((msg) => executeContract(msg));

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

const getCoins = (assets: { address: string; amount: string }[]) =>
  new Coins(
    assets
      .filter(
        (a) => !AccAddress.validate(a.address) && Numeric.parse(a.amount).gt(0),
      )
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((a) => Coin.fromData({ denom: a.address, amount: a.amount })),
  );

const createEncodedMessage = (msg: Record<string, unknown>) =>
  window.btoa(JSON.stringify(msg));

export const convertProtoToAminoMsg = (protoMsgs: MsgExecuteContract[]) => {
  return {
    msgs: protoMsgs.map(
      (protoMsg) =>
        new BeforeMsgExecuteContract(
          protoMsg.sender,
          protoMsg.contract,
          parseJsonFromBinary(protoMsg.msg),
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

const assetMsg = (asset: { address: string; amount: string }) => ({
  info: AccAddress.validate(asset.address)
    ? { token: { contract_addr: asset.address } }
    : { native_token: { denom: asset.address } },
  amount: asset.amount,
});

export const generateSimulationMsg = (offerAsset: string, amount: string) => ({
  simulation: {
    offer_asset: assetMsg({
      address: offerAsset,
      amount,
    }),
  },
});

export const generateReverseSimulationMsg = (
  askAsset: string,
  amount: string,
) => ({
  reverse_simulation: {
    ask_asset: assetMsg({
      address: askAsset,
      amount,
    }),
  },
});

export const generateCreatePoolMsg = (
  networkName: string,
  sender: string,
  assets: { address: string; amount: string }[],
) => [
  ...assets
    .filter(
      (a) => AccAddress.validate(a.address) && Numeric.parse(a.amount).gt(0),
    )
    .map((a) =>
      MsgExecuteContract.fromPartial({
        sender,
        contract: a.address,
        msg: toUtf8(
          JSON.stringify({
            increase_allowance: {
              amount: a.amount,
              spender: contractAddresses[networkName]?.factory,
            },
          }),
        ),
        funds: [],
      }),
    ),
  MsgExecuteContract.fromPartial({
    sender,
    contract: contractAddresses[networkName]?.factory || "",
    msg: toUtf8(
      JSON.stringify({
        create_pair: {
          assets: assets.map((a) => assetMsg(a)),
        },
      }),
    ),
    funds: getCoins(assets).map((coin) => ({
      denom: coin.denom,
      amount: coin.amount.toString(),
    })),
  }),
];

export const generateAddLiquidityMsg = (
  sender: string,
  contractAddress: string,
  assets: { address: string; amount: string }[],
  slippageTolerance: string,
  txDeadlineSeconds = 1200,
) => [
  ...assets
    .filter((a) => AccAddress.validate(a.address))
    .map((a) =>
      MsgExecuteContract.fromPartial({
        sender,
        contract: a.address,
        msg: toUtf8(
          JSON.stringify({
            increase_allowance: {
              amount: a.amount,
              spender: contractAddress,
            },
          }),
        ),
        funds: [],
      }),
    ),
  MsgExecuteContract.fromPartial({
    sender,
    contract: contractAddress,
    msg: toUtf8(
      JSON.stringify({
        provide_liquidity: {
          assets: assets.map((a) => assetMsg(a)),
          receiver: `${sender}`,
          deadline: Number(
            Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
          ),
          slippage_tolerance: `${(parseFloat(slippageTolerance) / 100).toFixed(
            4,
          )}`,
        },
      }),
    ),
    funds: getCoins(assets).map((coin) => ({
      denom: coin.denom,
      amount: coin.amount.toString(),
    })),
  }),
];

export const generateWithdrawLiquidityMsg = (
  sender: string,
  contractAddress: string,
  lpTokenAddress: string,
  amount: string,
  minAssets?: { address: string; amount: string }[],
  txDeadlineSeconds = 1200,
) =>
  MsgExecuteContract.fromPartial({
    sender,
    contract: lpTokenAddress,
    msg: toUtf8(
      JSON.stringify({
        send: {
          msg: createEncodedMessage({
            withdraw_liquidity: {
              min_assets: minAssets?.map((a) => assetMsg(a)),
              deadline: Number(
                Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
              ),
            },
          }),
          amount,
          contract: contractAddress,
        },
      }),
    ),
    funds: [],
  });

export const generateSwapMsg = (
  sender: string,
  contractAddress: string,
  fromAssetAddress: string,
  amount: string,
  beliefPrice: Numeric.Input,
  maxSpread = "0.1",
  txDeadlineSeconds = 1200,
) => {
  const maxSpreadFixed = `${(parseFloat(maxSpread) / 100).toFixed(4)}`;
  const isCW20 = AccAddress.validate(fromAssetAddress);

  if (isCW20) {
    const sendMsg = createEncodedMessage({
      swap: {
        max_spread: `${maxSpreadFixed}`,
        belief_price: `${beliefPrice}`,
        deadline: Number(
          Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
        ),
      },
    });

    return MsgExecuteContract.fromPartial({
      sender,
      contract: fromAssetAddress,
      msg: toUtf8(
        JSON.stringify({
          send: {
            msg: sendMsg,
            amount,
            contract: contractAddress,
          },
        }),
      ),
    });
  }
  return MsgExecuteContract.fromPartial({
    sender,
    contract: contractAddress,
    msg: toUtf8(
      JSON.stringify({
        swap: {
          offer_asset: assetMsg({
            address: fromAssetAddress,
            amount,
          }),
          max_spread: `${maxSpreadFixed}`,
          belief_price: `${beliefPrice}`,
          deadline: Number(
            Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
          ),
        },
      }),
    ),
    funds: getCoins([{ address: fromAssetAddress, amount }]).map((coin) => ({
      denom: coin.denom,
      amount: coin.amount.toString(),
    })),
  });
};

export const generateIncreaseLockupContractMsg = ({
  senderAddress,
  contractAddress,
  lpTokenAddress,
  amount,
  duration,
}: {
  senderAddress: string;
  contractAddress: string;
  lpTokenAddress: string;
  duration: number | string;
  amount?: number | string;
}) => {
  return MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: lpTokenAddress,
    msg: toUtf8(
      JSON.stringify({
        send: {
          msg: createEncodedMessage({
            increase_lockup: { duration: Number(duration) },
          }),
          amount: `${amount}`,
          contract: contractAddress,
        },
      }),
    ),
  });
};

export const generateCancelLockdropMsg = ({
  senderAddress,
  contractAddress,
  duration,
}: {
  senderAddress: string;
  contractAddress: string;
  duration: number | string;
}) => {
  return MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: contractAddress,
    msg: toUtf8(
      JSON.stringify({
        cancel: {
          duration: Number(duration),
        },
      }),
    ),
  });
};

export const generateClaimLockdropMsg = ({
  senderAddress,
  contractAddress,
  duration,
}: {
  senderAddress: string;
  contractAddress: string;
  duration: number | string;
}) => {
  return MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: contractAddress,
    msg: toUtf8(
      JSON.stringify({
        claim: {
          duration: Number(duration),
        },
      }),
    ),
  });
};

export const generateUnstakeLockdropMsg = ({
  senderAddress,
  contractAddress,
  duration,
}: {
  senderAddress: string;
  contractAddress: string;
  duration: number | string;
}) => {
  return MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: contractAddress,
    msg: toUtf8(
      JSON.stringify({
        unlock: {
          duration: Number(duration),
        },
      }),
    ),
  });
};

export const getAddressFromAssetInfo = (assetInfo: AssetInfo) => {
  if ("token" in assetInfo) {
    return assetInfo.token.contract_addr;
  }

  if ("native_token" in assetInfo) {
    return assetInfo.native_token.denom;
  }

  return undefined;
};
