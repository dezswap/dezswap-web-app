import { Asset } from "types/common";

export type Network = {
  lcd: string;
  chainId: string;
};

export const XPLA_ADDRESS = "axpla";
export const XPLA_SYMBOL = "XPLA";

const networks: Record<string, Network> = {
  dimension: {
    lcd: "https://dimension-lcd.xpla.dev",
    chainId: "dimension_37-1",
  },
  cube: {
    lcd: "https://cube-lcd.xpla.dev",
    chainId: "cube_47-5",
  },
};

export const nativeTokens: Record<string, Asset[]> = {
  mainnet: [
    {
      address: XPLA_ADDRESS,
      decimals: 18,
      name: XPLA_SYMBOL,
      symbol: XPLA_SYMBOL,
      total_supply: "",
      iconSrc: "https://assets.xpla.io/icon/svg/XPLA.svg",
      balance: "0",
    },
  ],
  testnet: [
    {
      address: XPLA_ADDRESS,
      decimals: 18,
      name: XPLA_SYMBOL,
      symbol: XPLA_SYMBOL,
      total_supply: "",
      iconSrc: "https://assets.xpla.io/icon/svg/XPLA.svg",
      balance: "0",
    },
  ],
};

export default networks;
