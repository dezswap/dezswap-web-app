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
  xpla: [
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
  xplatestnet: [
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
  fetchhub: [
    {
      token: "afet",
      name: "FET",
      symbol: "FET",
      total_supply: "",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
      chainId: "fetchhub",
      verified: true,
      protocol: "",
      decimals: 0,
    },
    {
      token: "nanomobx",
      name: "MOBX",
      symbol: "MOBX",
      total_supply: "",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/mobx.png",
      chainId: "fetchhub",
      verified: true,
      protocol: "",
      decimals: 0,
    },
  ],
  fetchhubtestnet: [
    {
      token: "atestfet",
      name: "FET",
      symbol: "FET",
      total_supply: "",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
      chainId: "fetchhub",
      verified: true,
      protocol: "",
      decimals: 0,
    },
    {
      token: "nanomobx",
      name: "MOBX",
      symbol: "MOBX",
      total_supply: "",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/mobx.png",
      chainId: "fetchhub",
      verified: true,
      protocol: "",
      decimals: 0,
    },
  ],
};

export default networks;
