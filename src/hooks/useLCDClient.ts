import { LCDClient } from "@xpla/xpla.js";
import { useNetwork } from "hooks/useNetwork";
import { useMemo } from "react";

export const useLCDClient = () => {
  const network = useNetwork();
  return useMemo(
    () =>
      new LCDClient({
        URL: network.lcd,
        chainID: network.chainID,
        gasAdjustment: 1.1,
      }),
    [network],
  );
};
