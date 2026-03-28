import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useCosmWasmClient } from "~/components/Providers/ClientProvider";
import { useNetwork } from "~/hooks/useNetwork";
import type { LockdropEstimatedReward } from "~/types/lockdrop";

const useExpectedReward = ({
  lockdropEventAddress,
  amount,
  duration,
}: {
  lockdropEventAddress?: string;
  amount?: number | string;
  duration?: number;
}) => {
  const client = useCosmWasmClient();
  const { chainName } = useNetwork();
  const { data } = useQuery({
    queryKey: [
      "estimatedLockdropReward",
      lockdropEventAddress,
      amount,
      duration,
      chainName,
    ],
    queryFn: async () => {
      if (!lockdropEventAddress || !amount || !duration || !client) {
        return null;
      }
      const res = (await client.queryContractSmart(lockdropEventAddress, {
        estimate: {
          amount: `${amount}`,
          duration,
        },
      })) as LockdropEstimatedReward;
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
