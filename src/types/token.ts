export type Balance = {
  balance: string;
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
};

export type VerifiedTokenInfo = {
  decimals: number;
  icon: string;
  name: string;
  protocol: string;
  symbol: string;
  token: string;
};

export type WhiteList = {
  cont_addr: string;
  [key: string]: unknown;
  // consuming only cont_addr; other values are effectively unknown.
}[];

export type VerifiedIbcTokenInfo = {
  decimals: number;
  icon: string;
  name: string;
  symbol: string;
  path: string;
  base_denom: string;
  denom: string;
};

export type VerifiedAssets = {
  [K in string]?: { [address: string]: VerifiedTokenInfo | undefined };
};

export type VerifiedIbcAssets = {
  [K in string]?: { [address: string]: VerifiedIbcTokenInfo | undefined };
};
