export type Network = {
  lcd: string;
  chainId: string;
};

export const XPLA_ADDRESS = "axpla";

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

export default networks;
