import { NetworkName } from "types/common";

export type SupportedChain = "dimension" | "cube";

export const supportedChains: {
  [K in SupportedChain]: {
    network: string;
    name: string;
    isMainnet: boolean;
  };
} = {
  dimension: {
    network: "xpla",
    name: "Mainnet",
    isMainnet: true,
  },
  cube: {
    network: "xpla",
    name: "Testnet",
    isMainnet: false,
  },
};

export const contractAddresses: {
  [K in NetworkName]?: {
    factory: string;
    router: string;
    lockdrop: string;
  };
} = {
  mainnet: {
    factory: "xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd",
    router: "xpla1uv4dz7ngaqwymvxggrjp3rnz3gs33szwjsnrxqg0ylkykqf8r7ns9s3cg4",
    lockdrop: "",
  },
  testnet: {
    factory: "xpla1j4kgjl6h4rt96uddtzdxdu39h0mhn4vrtydufdrk4uxxnrpsnw2qug2yx2",
    router: "xpla1pr40depxf8w50y58swdyhc0s2yjptd2xtqgnyfvkz6k40ng53gqqnyftkm",
    lockdrop: "xpla1009jkfkfs6x484a9s34zq030dk4sa0ygk8z7hw6hegcupkadjpfs39e5du",
  },
};

export const LP_DECIMALS = 6;
export const LOCKED_LP_SUPPLY = 1_000;

export const apiAddresses: {
  [K in NetworkName]?: {
    baseUrl: string;
  };
} = {
  mainnet: {
    baseUrl: "https://dimension-api.dezswap.io",
  },
  testnet: {
    baseUrl: "https://cube-api.dezswap.io",
  },
};
