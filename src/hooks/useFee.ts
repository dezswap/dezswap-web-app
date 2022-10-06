import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { useConnectedWallet, useLCDClient } from "@xpla/wallet-provider";
import { useEffect, useMemo, useState } from "react";

export const useFee = (txOptions?: CreateTxOptions) => {
  const connectedWallet = useConnectedWallet();
  const lcd = useLCDClient();
  const [fee, setFee] = useState<Fee>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const walletAddress = useMemo(
    () => connectedWallet?.walletAddress,
    [connectedWallet],
  );

  useEffect(() => {
    let isAborted = false;
    if (!connectedWallet || !txOptions) {
      setIsLoading(false);
      return () => {
        isAborted = true;
      };
    }

    const fetchFee = async () => {
      try {
        const tx = await lcd.tx.create(
          [{ address: walletAddress || "" }],
          txOptions,
        );

        if (!isAborted) {
          setFee(tx.auth_info.fee);
        }
      } catch (error) {
        console.log(`fetch failed: ${error}`);
        setIsFailed(true);
      }
      setIsLoading(false);
    };

    const timerId = setTimeout(
      () => {
        if (!isAborted) {
          fetchFee();
        }
      },
      fee ? 750 : 125,
    );

    setIsFailed(false);
    setIsLoading(true);

    return () => {
      isAborted = true;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [connectedWallet, lcd.tx, txOptions]);

  return { fee, isLoading, isFailed };
}