import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import useAPI from "~/hooks/useAPI";

const useFetchDecimal = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  const fetchDecimal = useCallback(
    async (tokenAddress: string) => {
      return queryClient.fetchQuery({
        queryKey: ["decimal", tokenAddress, api.isLoading],
        queryFn: () => api.getDecimal(tokenAddress),
        staleTime: Infinity,
        gcTime: Infinity,
      });
    },
    [api, queryClient],
  );

  return useMemo(
    () => ({
      fetchDecimal,
    }),
    [fetchDecimal],
  );
};

export default useFetchDecimal;
