import { LCDClient } from "@xpla/xpla.js";
import useNetwork from "hooks/useNetwork";
import { useMemo } from "react";

const useLCDClient = () => {
  const network = useNetwork();
  return useMemo(
    () =>
      new LCDClient({
        URL: network.lcd,
        chainID: network.chainID,
        gasAdjustment: 1.2,
      }),
    [network],
  );
};

export default useLCDClient;
