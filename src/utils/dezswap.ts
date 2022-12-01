import { Numeric } from "@xpla/xpla.js";
import { Asset, NativeAsset } from "types/pair";

export type Amount = string | number;

export const isNativeTokenAddress = (token: string) =>
  !token.startsWith("xpla");

export const generatePairsMsg = (options: {
  limit?: number;
  start_after?: [Asset | NativeAsset, Asset | NativeAsset];
}) => {
  return { pairs: options };
};

export const generateSimulationMsg = (
  offerAsset: string,
  amount: Numeric.Input,
) => {
  if (isNativeTokenAddress(offerAsset)) {
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
  askAsset: string,
  amount: Numeric.Input,
) => {
  if (isNativeTokenAddress(askAsset)) {
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
