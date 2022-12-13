export type Asset = {
  token: {
    contract_addr: string;
  };
};

export type NativeAsset = {
  native_token: {
    denom: string;
  };
};

export type PoolAsset = {
  info: Asset | NativeAsset;
  amount: string;
};

export interface Pool {
  assets: [PoolAsset, PoolAsset];
  total_share: string;
}

export interface Pair {
  asset_infos: [Asset | NativeAsset, Asset | NativeAsset];
  contract_addr: string;
  liquidity_token: string;
  asset_decimals: [number, number];
}

export type Simulation = {
  return_amount: string;
  spread_amount: string;
  commission_amount: string;
};

export type ReverseSimulation = {
  offer_amount: string;
  spread_amount: string;
  commission_amount: string;
};
