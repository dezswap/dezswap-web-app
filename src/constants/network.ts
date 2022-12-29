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
    {
      address:
        "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
      decimals: 6,
      name: "Axelar USD Coin",
      symbol: "axlUSDC",
      total_supply: "",
      iconSrc: "https://assets.xpla.io/icon/svg/ibc/axlUSDC.svg",
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
    {
      address:
        "ibc/5BDD47E9E73BF91C14497E254F0A751F1A7D3A6084343F66EA7CEE834A384651",
      decimals: 6,
      name: "Axelar USD Coin",
      symbol: "axlUSDC",
      total_supply: "",
      iconSrc: "https://assets.xpla.io/icon/svg/ibc/axlUSDC.svg",
      balance: "0",
    },
  ],
};

export default networks;
