import { useState, useEffect } from "react";
import useAPI from "./useAPI";
import useSigningClient from "./useSigningClient";
import useConnectedWallet from "./useConnectedWallet";

function useAuthSequence() {
  const api = useAPI();
  const [sequence, setSequence] = useState(0n);
  const { signingClient: client } = useSigningClient();
  const { walletAddress, isInterchain } = useConnectedWallet();

  useEffect(() => {
    const fetchAuthInfo = async () => {
      if (isInterchain) {
        try {
          const authSequence = await client?.getSequence(walletAddress);

          setSequence(authSequence || 0n);
        } catch (error) {
          console.error("Failed to fetch auth info:", error);
        }
      } else {
        try {
          const { sequence: authSequence } = (await api.getAuthInfo()) || {};
          setSequence(authSequence || 0n);
        } catch (error) {
          console.error("Failed to fetch auth info:", error);
        }
      }
    };

    fetchAuthInfo();
  }, [api, client, walletAddress]);

  return { sequence };
}

export default useAuthSequence;
