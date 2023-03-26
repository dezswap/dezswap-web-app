import { Coin, Coins, MsgExecuteContract, Numeric } from "@xpla/xpla.js";
import { Asset, NativeAsset } from "types/pair";
import { isNativeTokenAddress } from "utils";
import { NetworkName } from "types/common";
import { contractAddresses } from "constants/dezswap";

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

const assetMsg = (
  networkName: NetworkName,
  asset: { address: string; amount: string },
) => ({
  info: isNativeTokenAddress(networkName, asset.address)
    ? { native_token: { denom: asset.address } }
    : { token: { contract_addr: asset.address } },
  amount: asset.amount,
});

export const generateSimulationMsg = (
  networkName: NetworkName,
  offerAsset: string,
  amount: string,
) => ({
  simulation: {
    offer_asset: assetMsg(networkName, {
      address: offerAsset,
      amount,
    }),
  },
});

export const generateReverseSimulationMsg = (
  networkName: NetworkName,
  askAsset: string,
  amount: string,
) => ({
  reverse_simulation: {
    ask_asset: assetMsg(networkName, {
      address: askAsset,
      amount,
    }),
  },
});

export const generateCreatePoolMsg = (
  networkName: NetworkName,
  senderAddress: string,
  assets: { address: string; amount: string }[],
) => [
  ...assets
    .filter((a) => !isNativeTokenAddress(networkName, a.address))
    .map(
      (a) =>
        new MsgExecuteContract(
          senderAddress,
          a.address,
          {
            increase_allowance: {
              amount: a.amount,
              spender: contractAddresses[networkName]?.factory,
            },
          },
          [],
        ),
    ),
  new MsgExecuteContract(
    senderAddress,
    contractAddresses[networkName]?.factory || "",
    {
      create_pair: {
        assets: assets.map((a) => assetMsg(networkName, a)),
      },
    },
    new Coins(
      assets
        .filter((a) => isNativeTokenAddress(networkName, a.address))
        .map((a) => Coin.fromData({ denom: a.address, amount: a.amount })),
    ),
  ),
];

export const generateAddLiquidityMsg = (
  networkName: NetworkName,
  senderAddress: string,
  contractAddress: string,
  assets: { address: string; amount: string }[],
  txDeadlineSeconds = 1200,
) => [
  ...assets
    .filter((a) => !isNativeTokenAddress(networkName, a.address))
    .map(
      (a) =>
        new MsgExecuteContract(
          senderAddress,
          a.address,
          {
            increase_allowance: {
              amount: a.amount,
              spender: contractAddress,
            },
          },
          [],
        ),
    ),
  new MsgExecuteContract(
    senderAddress,
    contractAddress,
    {
      provide_liquidity: {
        assets: assets.map((a) => assetMsg(networkName, a)),
        receiver: `${senderAddress}`,
        deadline: Number(
          Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
        ),
      },
    },
    new Coins(
      assets
        .filter((a) => isNativeTokenAddress(networkName, a.address))
        .map((a) => Coin.fromData({ denom: a.address, amount: a.amount })),
    ),
  ),
];

export const generateWithdrawLiquidityMsg = (
  networkName: NetworkName,
  senderAddress: string,
  contractAddress: string,
  lpTokenAddress: string,
  amount: string,
  minAssets?: { address: string; amount: string }[],
  txDeadlineSeconds = 1200,
) =>
  new MsgExecuteContract(
    senderAddress,
    lpTokenAddress,
    {
      send: {
        msg: window.btoa(
          JSON.stringify({
            withdraw_liquidity: {
              min_assets: minAssets?.map((a) => assetMsg(networkName, a)),
              deadline: Number(
                Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
              ),
            },
          }),
        ),
        amount,
        contract: contractAddress,
      },
    },
    [],
  );

export const generateSwapMsg = (
  networkName: NetworkName,
  senderAddress: string,
  contractAddress: string,
  fromAssetAddress: string,
  amount: string,
  beliefPrice: Numeric.Input,
  maxSpread = "0.1",
  txDeadlineSeconds = 1200,
) => {
  const maxSpreadFixed = `${(parseFloat(maxSpread) / 100).toFixed(4)}`;
  if (isNativeTokenAddress(networkName, fromAssetAddress)) {
    return new MsgExecuteContract(
      senderAddress,
      contractAddress,
      {
        swap: {
          offer_asset: assetMsg(networkName, {
            address: fromAssetAddress,
            amount,
          }),
          max_spread: `${maxSpreadFixed}`,
          belief_price: `${beliefPrice}`,
          deadline: Number(
            Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
          ),
        },
      },
      new Coins({ [fromAssetAddress]: amount }),
    );
  }

  const sendMsg = window.btoa(
    JSON.stringify({
      swap: {
        max_spread: `${maxSpreadFixed}`,
        belief_price: `${beliefPrice}`,
        deadline: Number(
          Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
        ),
      },
    }),
  );

  return new MsgExecuteContract(
    senderAddress,
    fromAssetAddress,
    {
      send: {
        msg: sendMsg,
        amount,
        contract: contractAddress,
      },
    },
    [],
  );
};
