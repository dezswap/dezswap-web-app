import { useQuery } from "@tanstack/react-query";
import { createLCDClient } from "@xpla/xplajs/xpla/lcd";
import { CustomLCDClient } from "types/lcdClient";
import useNetwork from "./useNetwork";

const useLCDClient = () => {
  const {
    selectedChain: { apis },
  } = useNetwork();
  const restEndpoint = apis?.rest?.[0].address;

  const {
    data: client,
    isLoading,
    error,
  } = useQuery(
    ["lcdClient", restEndpoint],
    async () => {
      try {
        if (!restEndpoint)
          throw new Error("Chain lcd data could not be retrieved");

        const lcdClient = (await createLCDClient({
          restEndpoint,
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
    lcdUrl: restEndpoint,
  };
};

export default useLCDClient;
