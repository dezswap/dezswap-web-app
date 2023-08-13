import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import { useMemo } from "react";

const useExpectedReward = ({
  lockdropEventAddress,
  amount,
  duration,
}: {
  lockdropEventAddress?: string;
  amount?: number | string;
  duration?: number;
}) => {
  const { getEstimatedLockdropReward } = useAPI();
  const { data } = useQuery({
    queryKey: [
      "estimatedLockdropReward",
      lockdropEventAddress,
      amount,
      duration,
    ],
    queryFn: async () => {
      if (!lockdropEventAddress || !amount || !duration) {
        return null;
      }
      const res = await getEstimatedLockdropReward(
        lockdropEventAddress,
        amount,
        duration,
      );
      return res;
    },
  });

  return useMemo(
    () => ({
      expectedReward: data?.estimated_reward,
      totalReward: data?.lockdrop_total_reward,
    }),
    [data],
  );
};

export default useExpectedReward;
