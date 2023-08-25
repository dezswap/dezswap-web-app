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

  const getLockdropEventInfo = useCallback(
    async (address: string) => {
      const res = await api.getLockdropEventInfo(address);
      return res;
    },
    [api],
  );

  const getLockdropEventInfoByRewardToken = useCallback(
    (rewardTokenAddress: string) => {
      const lockdropEventAddress = lockdropEvents?.find(
        (event) => event.reward_token_addr === rewardTokenAddress,
      )?.addr;
      if (!lockdropEventAddress) {
        return undefined;
      }
      return getLockdropEventInfo(lockdropEventAddress);
    },
    [getLockdropEventInfo, lockdropEvents],
  );

  const getLockdropEventInfoByLPToken = useCallback(
    (lpTokenAddress: string) => {
      const lockdropEventAddress = lockdropEvents?.find(
        (event) => event.lp_token_addr === lpTokenAddress,
      )?.addr;
      if (!lockdropEventAddress) {
        return undefined;
      }
      return getLockdropEventInfo(lockdropEventAddress);
    },
    [getLockdropEventInfo, lockdropEvents],
  );

  return useMemo(
    () => ({
      lockdropEvents: lockdropEvents || [],
      isLoading,
      getLockdropEventInfo,
      getLockdropEventInfoByRewardToken,
      getLockdropEventInfoByLPToken,
    }),
    [
      getLockdropEventInfo,
      getLockdropEventInfoByLPToken,
      getLockdropEventInfoByRewardToken,
      isLoading,
      lockdropEvents,
    ],
  );
};

export default useLockdropEvents;
