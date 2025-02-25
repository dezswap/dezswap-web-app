import { useMemo } from "react";
import { createLCDClient } from "@xpla/xplajs/xpla/lcd";
import { CustomLCDClient } from "types/lcdClient";
import useNetwork from "./useNetwork";

const useLCDClient = () => {
  const network = useNetwork();
  return useMemo(
    () =>
      createLCDClient({
        restEndpoint: network.lcd,
      }) as unknown as CustomLCDClient,
    [network.lcd],
  );
};

export default useLCDClient;
