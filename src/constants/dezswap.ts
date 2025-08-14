import { assetLists, chains } from "@chain-registry/v2";
import Decimal from "decimal.js";
import iconXpla from "assets/icons/icon-chain-xpla-32px.svg";
import iconXplaGray from "assets/icons/icon-chain-xpla-gray-32px.svg";
import iconASI from "assets/icons/icon-chain-asi-32px.svg";

export type XplaChainNames = "dimension" | "cube";
export const DefaultChainName = "xpla";
const supportChainNames = [
  "xpla",
  "xplatestnet",
  "fetchhub",
  "fetchhubtestnet",
];

export const SupportedChains = chains.filter((chain) =>
  supportChainNames.includes(chain.chainName),
);
export const getChain = (searchName: string) => {
  if (!supportChainNames.includes(searchName))
    return chains.filter((chain) => chain.chainName === DefaultChainName);
  return chains.filter((chain) => chain.chainName === searchName);
};

export const getRpcEndpoint = (searchName: string) =>
  chains.filter((chain) => chain.chainName === searchName)[0]?.apis?.rpc?.[0]
    ?.address || "";

export const getAssetList = (searchName: string) =>
  assetLists.filter((assetList) => assetList.chainName === searchName);

export const xplaChains: {
  [K in XplaChainNames]: {
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
  [K in string]?: {
    factory: string;
    router: string;
    lockdrop: string;
    play3List?: string;
  };
} = {
  xpla: {
    factory: "xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd",
    router: "xpla1uv4dz7ngaqwymvxggrjp3rnz3gs33szwjsnrxqg0ylkykqf8r7ns9s3cg4",
    lockdrop: "",
    play3List: "",
  },
  xplatestnet: {
    factory: "xpla1j4kgjl6h4rt96uddtzdxdu39h0mhn4vrtydufdrk4uxxnrpsnw2qug2yx2",
    router: "xpla1pr40depxf8w50y58swdyhc0s2yjptd2xtqgnyfvkz6k40ng53gqqnyftkm",
    lockdrop: "xpla1009jkfkfs6x484a9s34zq030dk4sa0ygk8z7hw6hegcupkadjpfs39e5du",
    play3List:
      "xpla1hylp38a8rwzzktq0esvsqnuaxvvf3uvtsex8du8wcpawaaqjczus4st6s0",
  },
  fetchhub: {
    factory: "fetch1slz6c85kxp4ek5ufmcakfhnscv9r2snlemxgwz6cjhklgh7v2hms8rgt5v",
    router: "fetch1slz6c85kxp4ek5ufmcakfhnscv9r2snlemxgwz6cjhklgh7v2hms8rgt5v",
    lockdrop:
      "fetch1slz6c85kxp4ek5ufmcakfhnscv9r2snlemxgwz6cjhklgh7v2hms8rgt5v",
    play3List: "",
  },
  fetchhubtestnet: {
    factory: "fetch1kmag3937lrl6dtsv29mlfsedzngl9egv5c3apnr468q50gu04zrqea398u",
    router: "fetch1kmag3937lrl6dtsv29mlfsedzngl9egv5c3apnr468q50gu04zrqea398u",
    lockdrop:
      "fetch1kmag3937lrl6dtsv29mlfsedzngl9egv5c3apnr468q50gu04zrqea398u",
    play3List: "",
  },
};

export const getGasInfo = (chainName: string) => {
  if (chainName.includes("xpla"))
    return {
      multiplier: 1.2,
      gasPrice: {
        amount: new Decimal("280000000000"),
        denom: "axpla",
      },
    };
  return undefined;
};
export const LP_DECIMALS = 6;
export const LOCKED_LP_SUPPLY = 1_000;

export const apiAddresses: {
  [K in string]?: {
    baseUrl: string;
  };
} = {
  xpla: {
    baseUrl: "https://dimension-api.dezswap.io",
  },
  xplatestnet: {
    baseUrl: "https://cube-api.dezswap.io",
  },
  fetchhub: {
    baseUrl: "https://fetchhub-api.dezswap.io",
  },
  fetchhubtestnet: {
    baseUrl: " https://dorado-api.dezswap.io",
  },
};

export const CHAIN_ICONS: {
  [K in string]: string;
} = {
  xpla: iconXpla,
  xplatestnet: iconXplaGray,
  fetchhub: iconASI,
  fetchhubtestnet: iconASI,
};

export const CHAIN_NAME_SEARCH_PARAM = "chainname";

export const UNSUPPORT_WALLET_LIST: {
  [K in string]: string[];
} = {
  xpla: [],
  xplatestnet: ["cosmostation-extension"],
  fetchhub: [],
  fetchhubtestnet: [],
};
