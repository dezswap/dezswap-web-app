export type Balance = {
  balance: string;
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
};

export type VerifiedTokenInfo = {
  decimals: number;
  icon: string;
  name: string;
  protocol: string;
  symbol: string;
  token: string;
};

export type VerifiedAssets = {
  [K in NetworkName]?: { [address: string]: VerifiedTokenInfo | undefined };
};
