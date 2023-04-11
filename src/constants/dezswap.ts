import { NetworkName } from "types/common";

export const contractAddresses: {
  [K in NetworkName]?: {
    factory: string;
    router: string;
  };
} = {
  mainnet: {
    factory: "xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd",
    router: "xpla1uv4dz7ngaqwymvxggrjp3rnz3gs33szwjsnrxqg0ylkykqf8r7ns9s3cg4",
  },
  testnet: {
    factory: "xpla1j4kgjl6h4rt96uddtzdxdu39h0mhn4vrtydufdrk4uxxnrpsnw2qug2yx2",
    router: "xpla1pr40depxf8w50y58swdyhc0s2yjptd2xtqgnyfvkz6k40ng53gqqnyftkm",
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
