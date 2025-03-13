import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { useDeferredValue, useEffect, useState } from "react";
import { AxiosError } from "axios";
import useLCDClient from "hooks/useLCDClient";
import useAPI from "./useAPI";
import useWalletAddress from "./useWalletAddress";

const useFee = (txOptions?: CreateTxOptions) => {
  const connectedWallet = useConnectedWallet();
  const { walletAddress } = useWalletAddress();
  const lcd = useLCDClient();
  const [fee, setFee] = useState<Fee>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const api = useAPI();

  const deferredCreateTxOptions = useDeferredValue(txOptions);

  useEffect(() => {
    setIsLoading(true);
    setIsFailed(false);
  }, [txOptions]);

  useEffect(() => {
    let isAborted = false;
    if (!connectedWallet || !deferredCreateTxOptions) {
      setIsLoading(false);
      return () => {
        isAborted = true;
      };
    }

    const estimateFee = async () => {
      try {
        if (!walletAddress || !deferredCreateTxOptions) {
          setFee(undefined);
          setErrMsg("");
          setIsFailed(false);
          setIsLoading(false);
          return;
        }

        const res = await api.estimateFee(deferredCreateTxOptions);

        if (res && !isAborted) {
          setFee(res);
          setErrMsg("");
          setIsLoading(false);
          setIsFailed(false);
        }
      } catch (error) {
        console.log(error);
        const msg = (error as AxiosError<{ message: string }>)?.response?.data
          .message;
        if (msg) {
          if (msg.includes("Invalid zero amount")) {
            setErrMsg(
              "The amount of asset received is zero, please increase your LP amount to withdraw.",
            );
          }
          if (
            msg.includes("Max spread assertion") ||
            msg.includes("Max slippage assertion") ||
            msg.includes("Min amount assertion")
          ) {
            setErrMsg(
              "The estimated slippage has been exceeded the tolerance.",
            );
          }
        }
        if (!isAborted) {
          setFee(undefined);
          setIsFailed(true);
          setIsLoading(false);
        }
      }
    };

    const timerId = setTimeout(
      () => {
        if (!isAborted) {
          estimateFee();
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
  }, [connectedWallet, lcd, deferredCreateTxOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  return { fee, isLoading, isFailed, errMsg };
};

export default useFee;
