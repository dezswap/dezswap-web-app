import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWalletManager } from "@interchain-kit/react";
import { WalletState } from "@interchain-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
  useConnectedWallet as useConnectedXplaWallet,
  useWallet,
  WalletApp,
} from "@xpla/wallet-provider";
import { MessageComposer } from "@xpla/xplajs/cosmwasm/wasm/v1/tx.registry";
import { convertProtoToAminoMsg } from "utils/dezswap";
import { Coin } from "@xpla/xplajs/cosmos/base/v1beta1/coin";
import { TxRaw } from "@interchainjs/cosmos-types/cosmos/tx/v1beta1/tx";
import useNetwork from "./useNetwork";
import { NewMsgTxOptions } from "./useRequestPost";
import useSigningClient from "./useSigningClient";

const resetWalletValue = {
  walletAddress: "",
  isInterchain: false,
};

// FIXME: remove this temporary function once the type error in signAndBroadcastSync is fixed
function base64ToUint8Array(data: string | Uint8Array) {
  if (typeof data !== "string") return data;
  const binaryString = atob(data);

  const len = binaryString.length;

  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
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

        console.log(signingClient);
        if (!signingClient) {
          throw new Error("signingClient is not found");
        }
        return signingClient.signAndBroadcast(
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
      }
      return connectedXplaWallet?.post(
        { ...tx, ...convertProtoToAminoMsg(tx.msgs) } as unknown as Parameters<
          NonNullable<typeof connectedXplaWallet.post>
        >[0],
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
    if (walletInfo.isInterchain && wm.currentWalletName) {
      await wm.disconnect(wm.currentWalletName, chainName);
    } else {
      wallet.disconnect();

      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
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
