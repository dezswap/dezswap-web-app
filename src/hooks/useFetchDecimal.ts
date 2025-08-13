import { useCallback, useMemo } from "react";
import useAPI from "hooks/useAPI";
import { useQueryClient } from "@tanstack/react-query";

const useFetchDecimal = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  const fetchDecimal = useCallback(
    async (tokenAddress: string) => {
      return await queryClient.fetchQuery(
        ["decimal", tokenAddress, api.isLoading],
        () => api.getDecimal(tokenAddress),
        {
          staleTime: Infinity,
          cacheTime: Infinity,
        },
      );
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
