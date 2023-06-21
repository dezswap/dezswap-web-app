import { Token } from "types/api";

export type Network = {
  lcd: string;
  chainId: string;
};

export const XPLA_ADDRESS = "axpla";
export const XPLA_SYMBOL = "XPLA";

export const IBC_PREFIX = 4;

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

export const nativeTokens: Record<string, Token[]> = {
  mainnet: [
    {
      token: XPLA_ADDRESS,
      decimals: 18,
      name: XPLA_SYMBOL,
      symbol: XPLA_SYMBOL,
      total_supply: "",
      icon: "https://assets.xpla.io/icon/svg/XPLA.svg",
      chainId: networks.dimension.chainId,
      verified: true,
      protocol: "",
    },
  ],
  testnet: [
    {
      token: XPLA_ADDRESS,
      decimals: 18,
      name: XPLA_SYMBOL,
      symbol: XPLA_SYMBOL,
      total_supply: "",
      icon: "https://assets.xpla.io/icon/svg/XPLA.svg",
      chainId: networks.cube.chainId,
      verified: true,
      protocol: "",
    },
  ],
};

export default networks;
