import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWalletManager } from "@interchain-kit/react";
import { WalletState } from "@interchain-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
  useConnectedWallet as useConnectedXplaWallet,
  useWallet,
  WalletApp,
} from "@xpla/wallet-provider";
import { TxBody, TxRaw } from "@interchainjs/cosmos-types/cosmos/tx/v1beta1/tx";

import { MessageComposer } from "@xpla/xplajs/cosmwasm/wasm/v1/tx.registry";
import { convertProtoToAminoMsg } from "utils/dezswap";
import { Coin } from "@xpla/xplajs/cosmos/base/v1beta1/coin";
import useNetwork from "./useNetwork";
import { NewMsgTxOptions } from "./useRequestPost";
import useSigningClient from "./useSigningClient";

const resetWalletValue = {
  walletAddress: "",
  isInterchain: false,
};
function base64ToUint8Array(base64String: string) {
  const rawData = atob(base64String);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const useConnectedWallet = () => {
  const { signingClient } = useSigningClient();
  const wm = useWalletManager();
  const { chainName } = useNetwork();
  const connectedXplaWallet = useConnectedXplaWallet();
  const [walletInfo, setWalletInfo] = useState(resetWalletValue);
  const wallet = useWallet();
  const fetchWalletAddress = useCallback(async () => {
    if (wm.isReady && wm.currentChainName !== chainName) {
      const { walletState } =
        wm.getChainWalletState(wm.currentWalletName, wm.currentChainName) ?? {};
      if (walletState === WalletState.Connected) {
        await wm.disconnect(wm.currentWalletName, wm.currentChainName);
      }
      wm.setCurrentChainName(chainName);
    }

    const { walletState } =
      wm.getChainWalletState(wm.currentWalletName, chainName) ?? {};

    if (walletState === WalletState.Connected) {
      const accountData = await wm.getAccount(wm.currentWalletName, chainName);
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
      wm.chainWalletState,
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
    async (tx: NewMsgTxOptions, walletApp?: WalletApp | boolean) => {
      if (walletInfo.isInterchain) {
        const { executeContract } = MessageComposer.fromPartial;
        const messages = tx.msgs.map((txOption) => executeContract(txOption));
        if (!tx?.fee?.amount || !tx?.fee?.gas_limit) {
          throw new Error("PostError: Fee Not Found");
        }
        // const result = signingClient?.signAndBroadcastSync(
        //   walletInfo.walletAddress,
        //   messages,
        //   {
        //     amount: [
        //       ...tx.fee.amount.map((coin) =>
        //         Coin.fromPartial({
        //           amount: coin.amount.toString(),
        //           denom: coin.denom,
        //         }),
        //       ),
        //     ],
        //     gas: tx.fee.gas_limit.toString(),
        //   },
        // );
        // console.log("result", result);
        // return result;

        let txRaw = await signingClient?.sign(
          walletInfo.walletAddress,
          messages,
          {
            amount: [
              ...tx.fee.amount.map((coin) =>
                Coin.fromPartial({
                  amount: coin.amount.toString(),
                  denom: coin.denom,
                }),
              ),
            ],
            gas: tx.fee.gas_limit.toString(),
          },
          "",
        );

        // convert to uint8Array like
        if (txRaw?.authInfoBytes && txRaw?.bodyBytes && txRaw?.signatures) {
          txRaw = {
            authInfoBytes: base64ToUint8Array(
              (txRaw?.authInfoBytes ?? "") as unknown as string,
            ),
            bodyBytes: base64ToUint8Array(
              (txRaw?.bodyBytes ?? "") as unknown as string,
            ),
            signatures: txRaw?.signatures,
          };

          const txBytes = TxRaw.encode(txRaw).finish();
          const broadcasted = await signingClient?.broadcastTx(txBytes, {
            checkTx: true,
            deliverTx: false,
          });
          console.log(broadcasted);
          return broadcasted?.origin;
        }
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

  const disconnect = useCallback(async () => {
    wallet.disconnect();

    if (walletInfo.isInterchain && wm.currentWalletName) {
      await wm.disconnect(wm.currentWalletName, chainName);
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [chainName, wallet, walletInfo.isInterchain, wm]);

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
      disconnect,
    }),
    [walletInfo, post, availablePost, connectType, connection, disconnect],
  );
};

export default useConnectedWallet;
