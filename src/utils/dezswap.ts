import { Coins, MsgExecuteContract, Numeric } from "@xpla/xpla.js";
import { Asset, NativeAsset } from "types/pair";
import { isNativeTokenAddress } from "utils";

export type Amount = string | number;

export const generatePairsMsg = (options: {
  limit?: number;
  start_after?: [Asset | NativeAsset, Asset | NativeAsset];
}) => {
  return { pairs: options };
};

export const generateSimulationMsg = (
  networkName: string,
  offerAsset: string,
  amount: Numeric.Input,
) => {
  if (isNativeTokenAddress(networkName, offerAsset)) {
    return {
      simulation: {
        offer_asset: {
          amount: `${Numeric.parse(amount).toString()}`,
          info: {
            native_token: {
              denom: offerAsset,
            },
          },
        },
      },
    };
  }

  return {
    simulation: {
      offer_asset: {
        amount: `${Numeric.parse(amount).toString()}`,
        info: {
          token: {
            contract_addr: offerAsset,
          },
        },
      },
    },
  };
};

export const generateReverseSimulationMsg = (
  networkName: string,
  askAsset: string,
  amount: Numeric.Input,
) => {
  if (isNativeTokenAddress(networkName, askAsset)) {
    return {
      reverse_simulation: {
        ask_asset: {
          amount: `${Numeric.parse(amount).toString()}`,
          info: {
            native_token: {
              denom: askAsset,
            },
          },
        },
      },
    };
  }

  return {
    reverse_simulation: {
      ask_asset: {
        amount: `${Numeric.parse(amount).toString()}`,
        info: {
          token: {
            contract_addr: askAsset,
          },
        },
      },
    },
  };
};

export const generateSwapMsg = (
  networkName: string,
  senderAddress: string,
  contractAddress: string,
  fromAssetAddress: string,
  amount: Numeric.Input,
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
          offer_asset: {
            info: { native_token: { denom: fromAssetAddress } },
            amount: amount.toString(),
          },
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
      },
    }),
  );

  return new MsgExecuteContract(
    senderAddress,
    fromAssetAddress,
    {
      send: {
        msg: sendMsg,
        amount: amount.toString(),
        contract: contractAddress,
        deadline: Number(
          Number((Date.now() / 1000).toFixed(0)) + txDeadlineSeconds,
        ),
      },
    },
    [],
  );
};
