import { useEffect, useMemo, useState } from "react";
import { useLCDClient } from "@xpla/wallet-provider";
import { Pool } from "types/pair";
import { useAPI } from "hooks/useAPI";

const usePool = (contractAddress?: string) => {
  const lcd = useLCDClient();
  const [pool, setPool] = useState<Pool>();
  const api = useAPI();

  useEffect(() => {
    const fetchPool = async () => {
      if (!contractAddress) {
        setPool(undefined);
        return;
      }
      const res = await api.getPool(contractAddress);
      setPool(res);
    };

    fetchPool();
  }, [contractAddress, lcd]);

  return useMemo(() => pool, [pool]);
};

export default usePool;
