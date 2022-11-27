import { NetworkInfo, useWallet } from "@xpla/wallet-provider";
import { useMemo } from "react";

export const useNetwork = () => {
  const { network } = useWallet();

  return useMemo(() => network, [network]);
};
