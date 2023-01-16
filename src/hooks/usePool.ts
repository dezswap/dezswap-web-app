import { useEffect, useMemo, useState } from "react";
import { useLCDClient } from "@xpla/wallet-provider";
import { Pool } from "types/pair";
import { queryMessages } from "utils/dezswap";

const usePool = (contractAddress?: string) => {
  const lcd = useLCDClient();
  const [pool, setPool] = useState<Pool>();

  useEffect(() => {
    const fetchPool = async () => {
      if (!contractAddress) {
        setPool(undefined);
        return;
      }
      const res = await lcd?.wasm.contractQuery<Pool>(
        contractAddress,
        queryMessages.getPool(),
      );
      setPool(res);
    };

    fetchPool();
  }, [contractAddress, lcd]);

  return useMemo(() => pool, [pool]);
};

export default usePool;
