import {
  AccAddress,
  Coin,
  Coins,
  MsgExecuteContract,
  Numeric,
} from "@xpla/xpla.js";
import { Asset, NativeAsset } from "types/pair";
import { contractAddresses } from "constants/dezswap";
import { AssetInfo } from "types/api";
import { Buffer } from "buffer";

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
  return Buffer.from(JSON.stringify(query)).toString("base64");
};

const assetMsg = (asset: { address: string; amount: string }) => ({
  info: AccAddress.validate(asset.address)
    ? { token: { contract_addr: asset.address } }
    : { native_token: { denom: asset.address } },
  amount: asset.amount,
});

const getCoins = (assets: { address: string; amount: string }[]) =>
  new Coins(
    assets
      .filter(
        (a) => !AccAddress.validate(a.address) && Numeric.parse(a.amount).gt(0),
      )
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((a) => Coin.fromData({ denom: a.address, amount: a.amount })),
  );

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
  senderAddress: string,
  assets: { address: string; amount: string }[],
) => [
  ...assets
    .filter(
      (a) => AccAddress.validate(a.address) && Numeric.parse(a.amount).gt(0),
    )
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
    getCoins(assets),
  ),
];

export const generateAddLiquidityMsg = (
  networkName: string,
  senderAddress: string,
  contractAddress: string,
  assets: { address: string; amount: string }[],
  slippageTolerance: string,
  txDeadlineSeconds = 1200,
) => [
  ...assets
    .filter((a) => AccAddress.validate(a.address))
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
        slippage_tolerance: `${(parseFloat(slippageTolerance) / 100).toFixed(
          4,
        )}`,
      },
    },
    getCoins(assets),
  ),
];

export const generateWithdrawLiquidityMsg = (
  networkName: string,
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
  networkName: string,
  senderAddress: string,
  contractAddress: string,
  fromAssetAddress: string,
  amount: string,
  beliefPrice: Numeric.Input,
  maxSpread = "0.1",
  txDeadlineSeconds = 1200,
) => {
  const maxSpreadFixed = `${(parseFloat(maxSpread) / 100).toFixed(4)}`;
  if (AccAddress.validate(fromAssetAddress)) {
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
  }

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
    getCoins([{ address: fromAssetAddress, amount }]),
  );
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
  return new MsgExecuteContract(senderAddress, lpTokenAddress, {
    send: {
      msg: window.btoa(
        JSON.stringify({
          increase_lockup: { duration: Number(duration) },
        }),
      ),
      amount: `${amount}`,
      contract: contractAddress,
    },
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
  return new MsgExecuteContract(senderAddress, contractAddress, {
    cancel: {
      duration: Number(duration),
    },
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
  return new MsgExecuteContract(senderAddress, contractAddress, {
    claim: {
      duration: Number(duration),
    },
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
  return new MsgExecuteContract(senderAddress, contractAddress, {
    unlock: {
      duration: Number(duration),
    },
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
