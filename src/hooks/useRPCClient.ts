import { useQuery } from "@tanstack/react-query";
import { createRPCQueryClient } from "@xpla/xplajs/xpla/rpc.query";
import useNetwork from "./useNetwork";

const useRPCClient = () => {
  const { rpcUrl: rpcEndpoint } = useNetwork();

  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rpcClient", rpcEndpoint],
    queryFn: async () => {
      try {
        if (!rpcEndpoint)
          throw new Error("Chain rpc data could not be retrieved");

        const rpcClient = await createRPCQueryClient({
          rpcEndpoint,
        });

        return rpcClient;
      } catch (err) {
        console.error("RPC client Error:", err);
        throw err;
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    client,
    isLoading,
    error,
    rpcEndpoint,
  };
};

export default useRPCClient;
