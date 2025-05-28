import { useState, useEffect } from "react";
import useAPI from "./useAPI";
import useSigningClient from "./useSigningClient";
import useConnectedWallet from "./useConnectedWallet";

function useAuthSequence() {
  const api = useAPI();
  const [sequence, setSequence] = useState(0n);
  const { signingClient: client } = useSigningClient();
  const { walletAddress } = useConnectedWallet();

  useEffect(() => {
    const fetchAuthInfo = async () => {
      try {
        const authSequence = await client?.getSequence(walletAddress);

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
