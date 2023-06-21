import { useEffect, useMemo, useState } from "react";
import { Pool } from "types/api";
import useAPI from "hooks/useAPI";

const usePool = (contractAddress?: string) => {
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
  }, [contractAddress, api]);

  return useMemo(() => pool, [pool]);
};

export default usePool;
