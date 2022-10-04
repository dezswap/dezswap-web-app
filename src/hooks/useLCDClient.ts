import { LCDClient } from "@xpla/xpla.js";
import networks from "constants/network";

export const useLCDClient = (network: string) => {
  const lcd = new LCDClient({
    URL: networks[network].lcd,
    chainID: networks[network].lcd
  });

  return { lcd };
};
