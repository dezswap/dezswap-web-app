import { useEffect, useState } from "react";

import useAPI from "./useAPI";

function useAuthSequence() {
  const api = useAPI();
  const [sequence, setSequence] = useState(0n);

  useEffect(() => {
    const fetchAuthInfo = async () => {
      try {
        const { sequence: authSequence } = (await api.getAuthInfo()) || {};
        setSequence(authSequence || 0n);
      } catch (error) {
        console.error("Failed to fetch auth info:", error);
      }
    };

    fetchAuthInfo();
  }, [api]);

  return { sequence };
}

export default useAuthSequence;
