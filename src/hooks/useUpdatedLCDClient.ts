import { useQuery } from "@tanstack/react-query";
import { createLCDClient } from "@xpla/xplajs/xpla/lcd";
import { CustomLCDClient } from "types/lcdClient";
import useNetwork from "./useNetwork";

const useLCDClient = () => {
  const network = useNetwork();

  const {
    data: client,
    isLoading,
    error,
  } = useQuery(
    ["lcdClient", network.lcd],
    async () => {
      try {
        const lcdClient = (await createLCDClient({
          restEndpoint: network.lcd,
        })) as unknown as CustomLCDClient;

        return lcdClient;
      } catch (err) {
        console.error("LCD client Error:", err);
        throw err;
      }
    },
    {
      retry: 2,
    },
  );

  return {
    client,
    isLoading,
    error,
    lcdUrl: network.lcd,
  };
};

export default useLCDClient;
