import { useQuery } from "@tanstack/react-query";

import {
  useClientsLoading,
  useCosmWasmClient,
} from "~/components/Providers/ClientProvider";
import { contractAddresses } from "~/constants/dezswap";
import type { WhiteList } from "~/types/token";

import { useNetwork } from "./useNetwork";

const PLAY3_LIST_SIZE = 20;

const usePlay3WhiteList = () => {
  const client = useCosmWasmClient();
  const isClientsLoading = useClientsLoading();
  const { chainName } = useNetwork();

  const { data: whiteList = [] } = useQuery({
    queryKey: ["play3WhiteList"],
    queryFn: async () => {
      const contractAddress = contractAddresses[chainName]?.play3List;
      if (!client || !contractAddress) {
        return [];
      }
      let res: WhiteList = [];
      let lastAddress = "";

      while (true) {
        try {
          const result = (await client.queryContractSmart(contractAddress, {
            get_complete_meme_data_list: {
              start_after: lastAddress,
              limit: PLAY3_LIST_SIZE,
            },
          })) as { data: WhiteList };

          const parsed = result?.data;

          if (!parsed || parsed.length === 0) break;
          res = [...res, ...parsed];
          lastAddress = res[res.length - 1].cont_addr;
          if (parsed.length < PLAY3_LIST_SIZE) break;
        } catch {
          return res.map((token) => token.cont_addr);
        }
      }
      return res.map((token) => token.cont_addr);
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
    enabled: !isClientsLoading,
    retry: 3,
  });

  return whiteList;
};

export default usePlay3WhiteList;
