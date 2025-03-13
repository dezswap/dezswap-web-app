import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { LockdropEvent } from "types/lockdrop";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useLockdropEvents = () => {
  const { selectedChain: chainId } = useNetwork();
  const api = useAPI();
  const {
    data: lockdropEvents,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["lockdropEvents", chainId],
    queryFn: async () => {
      const fetchAll = async (
        prevData: LockdropEvent[] = [],
        startAfter = 0,
      ): Promise<LockdropEvent[]> => {
        try {
          const res = await api.getLockdropEvents(startAfter);
          if (
            !res?.events?.length ||
            !!prevData.find(
              ({ addr }) => addr === res?.events.slice(-1)[0].addr,
            )
          ) {
            return prevData;
          }
          return fetchAll(
            [...prevData, ...res.events].filter(({ addr }, index, array) => {
              return (
                index ===
                array.findIndex((item) => {
                  return addr === item.addr;
                })
              );
            }),
            res.events.slice(-1)[0].start_at + 1,
          );
        } catch (error) {
          console.log(error);
          return prevData;
        }
      };
      const res = await fetchAll();
      return res || [];
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
      refetch,
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
      refetch,
    ],
  );
};

export default useLockdropEvents;
