import axios from "axios";

import { useCallback, useMemo } from "react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { CreateTxOptions } from "@xpla/xpla.js";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
  getQueryData,
} from "utils/dezswap";
import { VerifiedAssets, VerifiedIbcAssets } from "types/token";
import { TokenBalance } from "types/lcdClient";
import {
  LockdropEstimatedReward,
  LockdropEventInfo,
  LockdropEvents,
  LockdropUserInfo,
} from "types/lockdrop";
import { contractAddresses } from "constants/dezswap";
import useNetwork from "hooks/useNetwork";
import useLCDClient from "hooks/useLCDClient";
import useUpdatedLCDClient from "hooks/useUpdatedLCDClient";
import api, { ApiVersion } from "api";
import { ReverseSimulation, Simulation } from "types/pair";
import useWalletAddress from "./useWalletAddress";

const useAPI = (version: ApiVersion = "v1") => {
  const network = useNetwork();
  const lcd = useLCDClient();
  const { client: updatedLcd, lcdUrl, isLoading } = useUpdatedLCDClient();
  const connectedWallet = useConnectedWallet();
  const { walletAddress } = useWalletAddress();

  const apiClient = useMemo(
    () => api(network.name, version),
    [network.name, version],
  );

  const simulate = useCallback(
    async (contractAddress: string, offerAsset: string, amount: string) => {
      if (!updatedLcd) return undefined;
      const queryData = getQueryData(
        generateSimulationMsg(network.name, offerAsset, amount),
      );
      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: contractAddress,
          queryData,
        });

      return res as unknown as Simulation;
    },
    [network.name, updatedLcd],
  );

  const reverseSimulate = useCallback(
    async (contractAddress: string, askAsset: string, amount: string) => {
      if (!updatedLcd) return undefined;

      const queryData = getQueryData(
        generateReverseSimulationMsg(network.name, askAsset, amount),
      );

      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: contractAddress,
          queryData,
        });

      return res as unknown as ReverseSimulation;
    },
    [network.name, updatedLcd],
  );

  const getNativeTokenBalance = useCallback(
    async (denom: string) => {
      if (!denom || !walletAddress || !updatedLcd) {
        return undefined;
      }

      const res = await updatedLcd.cosmos.bank.v1beta1.balance({
        address: walletAddress,
        denom,
      });

      if (res && res.balance) {
        return res.balance.amount;
      }

      return undefined;
    },
    [updatedLcd, walletAddress],
  );

  const getTokenBalance = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress || !walletAddress || !updatedLcd) {
        return undefined;
      }

      const queryData = getQueryData({
        balance: { address: walletAddress },
      });

      const { data } = await updatedLcd.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      const res = data as unknown as TokenBalance;

      return res.balance;
    },
    [updatedLcd, walletAddress],
  );

  const getVerifiedTokenInfos = useCallback(
    /**
     * @Deprecated
     */
    async () => {
      const { data } = await axios.get<VerifiedAssets>(
        "https://assets.xpla.io/cw20/tokens.json",
      );
      return data;
    },
    [],
  );

  const getVerifiedIbcTokenInfos = useCallback(
    /**
     * @Deprecated
     */
    async () => {
      const { data } = await axios.get<VerifiedIbcAssets>(
        "https://assets.xpla.io/ibc/tokens.json",
      );
      return data;
    },
    [],
  );

  const getLatestBlockHeight = useCallback(async () => {
    if (!updatedLcd) return undefined;

    const res =
      await updatedLcd.cosmos.base.tendermint.v1beta1.getLatestBlock();

    return res.block?.header.height as unknown as string;
  }, [updatedLcd]);

  // unused func
  // const getDecimal = useCallback(
  //   async (denom: string) => {
  //     const contractAddress = contractAddresses[network.name]?.factory;
  //     if (!contractAddress || !denom) {
  //       return undefined;
  //     }

  //     const queryData = toBase64(
  //       toUtf8(
  //         JSON.stringify({
  //           native_token_decimals: { denom },
  //         }),
  //       ),
  //     )

  //     const { data: res } = await updatedLcd.cosmwasm.wasm.v1.smartContractState({
  //       address: contractAddress,
  //       queryData,
  //     });
  //     const tokenDecimals = res as unknown as Decimal;
  //     return tokenDecimals.decimals;
  //   },
  //   [network.name, lcd],
  // );

  const getLockdropEvents = useCallback(
    async (startAfter = 0) => {
      const contractAddress = contractAddresses[network.name]?.lockdrop;
      if (!contractAddress || !updatedLcd) {
        return undefined;
      }

      const queryData = getQueryData({
        events_by_end: { start_after: startAfter },
      });

      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: contractAddress,
          queryData,
        });

      return res as unknown as LockdropEvents;
    },
    [updatedLcd, network.name],
  );

  const getLockdropEventInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!updatedLcd) return undefined;

      const queryData = getQueryData({
        event_info: {},
      });

      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: lockdropEventAddress,
          queryData,
        });

      return res as unknown as LockdropEventInfo;
    },
    [updatedLcd],
  );

  const getLockdropUserInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!walletAddress || !lockdropEventAddress || !updatedLcd) {
        return undefined;
      }

      const queryData = getQueryData({
        user_info: {
          addr: walletAddress,
        },
      });

      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: lockdropEventAddress,
          queryData,
        });

      return res as unknown as LockdropUserInfo;
    },
    [updatedLcd, walletAddress],
  );

  const getEstimatedLockdropReward = useCallback(
    async (
      lockdropEventAddress: string,
      amount: number | string,
      duration: number,
    ) => {
      if (!walletAddress || !lockdropEventAddress || !updatedLcd) {
        return undefined;
      }

      const queryData = getQueryData({
        estimate: {
          amount: `${amount}`,
          duration,
        },
      });

      const { data: res } =
        await updatedLcd.cosmwasm.wasm.v1.smartContractState({
          address: lockdropEventAddress,
          queryData,
        });

      return res as unknown as LockdropEstimatedReward;
    },
    [updatedLcd, walletAddress],
  );

  // TODO: Replace with XplaSigningClient
  const estimateFee = useCallback(
    async (txOptions: CreateTxOptions) => {
      if (!connectedWallet) {
        return undefined;
      }
      const account = await lcd.auth.accountInfo(walletAddress);
      const res = await lcd.tx.estimateFee(
        [
          {
            sequenceNumber: account.getSequenceNumber(),
            publicKey: account.getPublicKey(),
          },
        ],
        txOptions,
      );

      return res;
    },
    [connectedWallet, lcd],
  );

  return useMemo(
    () => ({
      ...apiClient,
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfos,
      getVerifiedIbcTokenInfos,
      getLatestBlockHeight,
      // getDecimal,
      getLockdropEvents,
      getLockdropEventInfo,
      getLockdropUserInfo,
      getEstimatedLockdropReward,
      estimateFee,
      lcdUrl,
      isLoading,
    }),
    [
      apiClient,
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfos,
      getVerifiedIbcTokenInfos,
      getLatestBlockHeight,
      // getDecimal,
      getLockdropEvents,
      getLockdropEventInfo,
      getLockdropUserInfo,
      getEstimatedLockdropReward,
      estimateFee,
      lcdUrl,
      isLoading,
    ],
  );
};

export default useAPI;
