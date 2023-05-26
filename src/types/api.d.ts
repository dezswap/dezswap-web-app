export type AssetInfo =
  | {
      token: {
        contract_addr: string;
      };
    }
  | {
      native_token: {
        denom: string;
      };
    };

export interface Pair {
  asset_decimals: [number, number];
  asset_infos: [AssetInfo, AssetInfo];
  contract_addr: string;
  liquidity_token: string;
}

export interface Pairs {
  pairs: Pair[];
}

export interface PoolAsset {
  info: AssetInfo;
  amount: string;
}

export interface Pool {
  address: string;
  assets: [PoolAsset, PoolAsset];
  total_share: string;
}

export interface Token {
  chainId: string;
  decimals: number;
  icon: string;
  name: string;
  protocol: string;
  symbol: string;
  token: string;
  total_supply: string;
  verified: boolean;
}
