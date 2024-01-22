import useAPI from "hooks/useAPI";
import { useQuery } from "@tanstack/react-query";
import useNetwork from "./useNetwork";

const UPDATE_INTERVAL = 3000;

export const useLatestBlock = () => {
  const api = useAPI();
  const network = useNetwork();

  const { data: height } = useQuery({
    queryKey: ["latestBlockHeight", network.name],
    queryFn: api.getLatestBlockHeight,
    refetchInterval: UPDATE_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return height;
};
