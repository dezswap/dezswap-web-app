export type Balance = {
  balance: string;
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
};

export type AllowedTokenInfo = {
  decimals: number;
  icon: string;
  name: string;
  protocol: string;
  symbol: string;
  token: string;
}