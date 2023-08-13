import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useLockdropEvents = () => {
  const network = useNetwork();
  const api = useAPI();
  const { data: lockdropEvents, isLoading } = useQuery({
    queryKey: ["lockdropEvents", network?.chainID],
    queryFn: async () => {
      const res = await api.getLockdropEvents();
      return res?.events || [];
    },
  });

  const getLockdropEvent = useCallback(
    (address: string) => {
      return lockdropEvents?.find((event) => event.addr === address);
    },
    [lockdropEvents],
  );

  const getLockdropEventByRewardToken = useCallback(
    (address: string) => {
      return lockdropEvents?.find(
        (event) => event.reward_token_addr === address,
      );
    },
    [lockdropEvents],
  );

  const getLockdropEventByLPToken = useCallback(
    (address: string) => {
      return lockdropEvents?.find((event) => event.lp_token_addr === address);
    },
    [lockdropEvents],
  );

  return useMemo(
    () => ({
      lockdropEvents: lockdropEvents || [],
      isLoading,
      getLockdropEvent,
      getLockdropEventByRewardToken,
      getLockdropEventByLPToken,
    }),
    [
      getLockdropEvent,
      getLockdropEventByLPToken,
      getLockdropEventByRewardToken,
      isLoading,
      lockdropEvents,
    ],
  );
};

export default useLockdropEvents;
