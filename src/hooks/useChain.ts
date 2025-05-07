import { useChain as useIChain } from "@interchain-kit/react";
import { useMemo } from "react";
import { getValidChain } from "utils/dezswap";

export const useChain = (inputChainName: string | null) => {
  const { chainName, isValidChain } = useMemo(() => {
    return getValidChain(inputChainName);
  }, [inputChainName]);

  return {
    ...useIChain(chainName),
    isValidChain,
    chainName,
  };
};
