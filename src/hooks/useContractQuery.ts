import { useQuery } from "@tanstack/react-query";

import { useCosmWasmClient } from "~/components/Providers/ClientProvider";

export function useContractQuery<T>(
  key: string[],
  contractAddress: string | undefined,
  queryMsg: Record<string, unknown> | undefined,
  options?: { enabled?: boolean },
) {
  const client = useCosmWasmClient();
  return useQuery({
    queryKey: [...key, contractAddress],
    queryFn: async () => {
      if (!client || !contractAddress || !queryMsg) return undefined;
      return client.queryContractSmart(contractAddress, queryMsg) as Promise<T>;
    },
    enabled:
      !!client && !!contractAddress && !!queryMsg && (options?.enabled ?? true),
  });
}
