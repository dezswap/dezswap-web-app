import { useEffect, useMemo, useState } from "react";
import { useAPI } from "hooks/useAPI";

const UPDATE_INTERVAL = 3000;

export const useLatestBlock = () => {
  const [height, setHeight] = useState<string>();
  const api = useAPI();

  useEffect(() => {
    const fetchHeight = () => {
      api
        .getLatestBlockHeight()
        .then((value) => typeof value !== "undefined" && setHeight(`${value}`));
    };

    const intervalId = setInterval(() => fetchHeight(), UPDATE_INTERVAL);
    fetchHeight();

    return () => {
      clearInterval(intervalId);
    };
  }, [api]);

  return useMemo(() => height, [height]);
};
