import { useMemo } from "react";
import useBalances from "./useBalances";

const useBalance = (address?: string) => {
  const balances = useBalances(address ? [address] : []);

  return useMemo(() => balances[0]?.balance || "0", [balances]);
};

export default useBalance;
