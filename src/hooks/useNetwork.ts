import { useWallet } from "@xpla/wallet-provider";
import { useMemo } from "react";
import { NetworkName } from "types/common";

const useNetwork = () => {
  const wallet = useWallet();
  return useMemo(
    () => ({ ...wallet.network, name: wallet.network.name as NetworkName }),
    [wallet.network],
  );
};

export default useNetwork;
