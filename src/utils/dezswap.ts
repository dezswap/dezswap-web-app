import {Asset, NativeAsset} from "../types/pair";

export type Amount = string | number;

export const isNativeTokenAddress = (token: string) =>
  !token.startsWith("xpla");

export const generatePairsMsg = (startAfter?: string[]) => {
  return startAfter ? {
    pairs: {
      start_after: startAfter.map((asset) => {
        if (isNativeTokenAddress(asset)) {
          return {
            native_token: {
              denom: `${asset}`,
            }
          }
        } else {
          return {
            token: {
              contract_addr: `${asset}`,
            }
          }
        }
      })
    },
  } : { pairs: {} };
};

export const generateSimulationMsg = (offerAsset: string, amount: Amount) => {
  if (isNativeTokenAddress(offerAsset)) {
    return {
      simulation: {
        offer_asset: {
          amount: `${amount}`,
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
        amount: `${amount}`,
        info: {
          token: {
            contract_addr: offerAsset,
          },
        },
      },
    },
  };
};

export const generateReverseSimulationMsg = (askAsset: string, amount: Amount) => {
  if (isNativeTokenAddress(askAsset)) {
    return {
      reverse_simulation: {
        ask_asset: {
          amount: `${amount}`,
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
        amount: `${amount}`,
        info: {
          token: {
            contract_addr: askAsset,
          },
        },
      },
    },
  };
};