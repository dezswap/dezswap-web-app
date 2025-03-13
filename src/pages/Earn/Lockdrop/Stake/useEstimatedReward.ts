import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
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
  const {
    selectedChain: { chainName },
  } = useNetwork();
  const { data } = useQuery({
    queryKey: [
      "estimatedLockdropReward",
      lockdropEventAddress,
      amount,
      duration,
      chainName,
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
      return res || null;
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
