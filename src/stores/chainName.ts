import { createStore, useStore } from "zustand";

import { DefaultChainName } from "~/constants/dezswap";

interface ChainNameState {
  chainName: string;
}

export const chainNameStore = createStore<ChainNameState>()(() => ({
  chainName: DefaultChainName,
}));

export const useChainName = () => useStore(chainNameStore, (s) => s.chainName);
