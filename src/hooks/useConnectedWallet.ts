import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWalletManager } from "@interchain-kit/react";
import { WalletState } from "@interchain-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
  useConnectedWallet as useConnectedXplaWallet,
  WalletApp,
} from "@xpla/wallet-provider";
import { MessageComposer } from "@xpla/xplajs/cosmwasm/wasm/v1/tx.registry";
import { convertProtoToAminoMsg } from "utils/dezswap";
import useNetwork from "./useNetwork";
import { NewMsgTxOptions } from "./useRequestPost";
import useSigningClient from "./useSigningClient";

const resetWalletValue = {
  walletAddress: "",
  isInterchain: false,
};

const useConnectedWallet = () => {
  const { signingClient } = useSigningClient();
  const wm = useWalletManager();
  const { chainName } = useNetwork();
  const connectedXplaWallet = useConnectedXplaWallet();
  const [walletInfo, setWalletInfo] = useState(resetWalletValue);

  const fetchWalletAddress = useCallback(async () => {
    const { currentWalletName, currentChainName } = wm;
    const { walletState } =
      wm.getChainWalletState(currentWalletName, chainName) ?? {};

    if (currentChainName && currentChainName !== chainName) {
      wm.disconnect(currentWalletName, currentChainName);
    }
    if (walletState === WalletState.Connected) {
      const accountData = await wm.getAccount(
        currentWalletName,
        currentChainName,
      );
      if (!accountData) throw new Error("Failed to fetch account data");
      return {
        walletAddress: accountData.address,
        isInterchain: true,
      };
    }
    if (connectedXplaWallet?.walletAddress) {
      return {
        walletAddress: connectedXplaWallet.walletAddress,
        isInterchain: false,
      };
    }

    return resetWalletValue;
  }, [chainName, connectedXplaWallet?.walletAddress, wm]);

  const { data: walletAddressResult } = useQuery({
    queryKey: [
      "walletAddress",
      chainName,
      wm.currentWalletName,
      connectedXplaWallet?.connectType,
    ],
    queryFn: () => {
      return fetchWalletAddress();
    },
    enabled: !!chainName && !!wm,
    refetchOnMount: false,
    retry: 2,
  });

  const prevDataString = useRef("");

  const post = useCallback(
    (tx: NewMsgTxOptions, walletApp?: WalletApp | boolean) => {
      if (walletInfo.isInterchain) {
        const { executeContract } = MessageComposer.fromPartial;
        const messages = tx.msgs.map((txOption) => executeContract(txOption));
        if (!tx?.fee?.amount || !tx?.fee?.gas_limit) {
          throw new Error("PostError: Fee Not Found");
        }
        return signingClient?.signAndBroadcast(
          walletInfo.walletAddress,
          messages,
          {
            amount: [...tx.fee.amount],
            gas: tx.fee.gas_limit.toString(),
          },
        );
      }
      return connectedXplaWallet?.post(
        { ...tx, ...convertProtoToAminoMsg(tx.msgs) },
        walletApp,
      );
    },
    [
      connectedXplaWallet,
      signingClient,
      walletInfo.isInterchain,
      walletInfo.walletAddress,
    ],
  );

  const availablePost = useMemo(
    () => (walletInfo.isInterchain ? null : connectedXplaWallet?.availablePost),
    [connectedXplaWallet?.availablePost, walletInfo.isInterchain],
  );

  const connectType = useMemo(
    () =>
      walletInfo.isInterchain ? undefined : connectedXplaWallet?.connectType,
    // TODO: Implement with XplaSingingClient
    [connectedXplaWallet?.connectType, walletInfo.isInterchain],
  );

  const connection = useMemo(
    () =>
      walletInfo.isInterchain ? undefined : connectedXplaWallet?.connection,
    // TODO: Implement with XplaSingingClient
    [connectedXplaWallet?.connection, walletInfo.isInterchain],
  );

  useEffect(() => {
    if (prevDataString.current !== JSON.stringify(walletAddressResult)) {
      prevDataString.current = JSON.stringify(walletAddressResult);
      setWalletInfo((prevData) => ({ ...prevData, ...walletAddressResult }));
    }
  }, [walletAddressResult]);

  return useMemo(
    () => ({
      ...walletInfo,
      post,
      availablePost,
      connectType,
      connection,
    }),
    [walletInfo, post, availablePost, connectType, connection],
  );
};

export default useConnectedWallet;
