import { LCDClient } from "@xpla/xpla.js";
import useNetwork from "hooks/useNetwork";
import { useMemo } from "react";

const useLCDClient = () => {
  const {
    selectedChain: { apis, chainId },
  } = useNetwork();
  return useMemo(() => {
    if (!chainId || !apis?.rest?.[0])
      throw new Error("Chain data could not be retrieved");

    return new LCDClient({
      URL: apis.rest[0].address,
      chainID: chainId,
      gasAdjustment: 1.2,
    });
  }, [apis, chainId]);
};

export default useLCDClient;
