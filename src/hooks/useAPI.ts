// TODO: refactor this hook using react-query
/* eslint-disable react-hooks/preserve-manual-memoization */
import { calculateFee } from "@interchainjs/cosmos/utils/chain.js";
import { EncodeObject } from "@xpla/xplajs/types";
import axios from "axios";
import { useCallback, useMemo } from "react";

import { contractAddresses, getGasInfo } from "~/constants/dezswap";

import { useNetwork } from "~/hooks/useNetwork";

import type {
  LockdropEstimatedReward,
  LockdropEventInfo,
  LockdropEvents,
  LockdropUserInfo,
} from "~/types/lockdrop";
import type { ReverseSimulation, Simulation } from "~/types/pair";
import type {
  VerifiedAssets,
  VerifiedIbcAssets,
  WhiteList,
} from "~/types/token";

import {
  createEncodedTx,
  generateReverseSimulationMsg,
  generateSimulationMsg,
  hasChainPrefix,
} from "~/utils/dezswap";
import { Json } from "~/utils/encode";

import useConnectedWallet from "./useConnectedWallet";
import useRPCClient from "./useRPCClient";

const PLAY3_LIST_SIZE = 20;

const useAPI = () => {
  const {
    chainName,
    selectedChain: { chainId },
  } = useNetwork();
  const { client, rpcEndpoint, isLoading } = useRPCClient();
  const { walletAddress } = useConnectedWallet();

  const simulate = useCallback(
    async (contractAddress: string, offerAsset: string, amount: string) => {
      if (!client) return undefined;
      const queryData = Json.toBytes(generateSimulationMsg(offerAsset, amount));
      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return Json.fromBytes<Simulation>(data);
    },
    [client],
  );

  const reverseSimulate = useCallback(
    async (contractAddress: string, askAsset: string, amount: string) => {
      if (!client) return undefined;

      const queryData = Json.toBytes(
        generateReverseSimulationMsg(askAsset, amount),
      );

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return Json.fromBytes<ReverseSimulation>(data);
    },
    [client],
  );

  const getNativeTokenBalance = useCallback(
    async (denom: string) => {
      if (!denom || !walletAddress || !client) {
        return undefined;
      }

      const res = await client.cosmos.bank.v1beta1.balance({
        address: walletAddress,
        denom,
      });

      if (res && res.balance) {
        return res.balance.amount;
      }

      return undefined;
    },
    [client, walletAddress],
  );

  const getTokenBalance = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress || !walletAddress || !client) {
        return undefined;
      }

      const queryData = Json.toBytes({
        balance: { address: walletAddress },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      const res = Json.fromBytes<{ balance: string }>(data);

      return res.balance;
    },
    [client, walletAddress],
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
    if (!client) return "0";

    const res = await client.cosmos.base.tendermint.v1beta1.getLatestBlock();

    return res.block?.header.height ?? ("0" as unknown as string);
  }, [client]);

  const getDecimal = useCallback(
    async (denom: string) => {
      const contractAddress = contractAddresses[chainName]?.factory;
      if (!denom || !client || !contractAddress) {
        return undefined;
      }

      const isNativeTokenAddress = hasChainPrefix(denom);
      const queryData = Json.toBytes(
        isNativeTokenAddress
          ? { token_info: {} }
          : { native_token_decimals: { denom } },
      );

      const targetAddress = isNativeTokenAddress ? denom : contractAddress;

      try {
        const { data: res } = await client.cosmwasm.wasm.v1.smartContractState({
          address: targetAddress,
          queryData,
        });

        const parsed = Json.fromBytes<{ decimals: number }>(res);
        return isNativeTokenAddress ? { a: parsed.decimals } : parsed.decimals;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    },
    [chainName, client],
  );

  const getLockdropEvents = useCallback(
    async (startAfter = 0) => {
      const contractAddress = contractAddresses?.[chainName]?.lockdrop;
      if (!contractAddress || !client) {
        return undefined;
      }

      const queryData = Json.toBytes({
        events_by_end: { start_after: startAfter },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return Json.fromBytes<LockdropEvents>(data);
    },
    [client, chainName],
  );

  const getLockdropEventInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!client) return undefined;

      const queryData = Json.toBytes({
        event_info: {},
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return Json.fromBytes<LockdropEventInfo>(data);
    },
    [client],
  );

  const getLockdropUserInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!walletAddress || !lockdropEventAddress || !client) {
        return undefined;
      }

      const queryData = Json.toBytes({
        user_info: {
          addr: walletAddress,
        },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return Json.fromBytes<LockdropUserInfo>(data);
    },
    [client, walletAddress],
  );

  const getEstimatedLockdropReward = useCallback(
    async (
      lockdropEventAddress: string,
      amount: number | string,
      duration: number,
    ) => {
      if (!walletAddress || !lockdropEventAddress || !client) {
        return undefined;
      }

      const queryData = Json.toBytes({
        estimate: {
          amount: `${amount}`,
          duration,
        },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return Json.fromBytes<LockdropEstimatedReward>(data);
    },
    [client, walletAddress],
  );

  const getPlay3List = useCallback(async () => {
    const contractAddress = contractAddresses[chainName]?.play3List;
    if (isLoading) return;
    if (!client || !contractAddress) {
      return undefined;
    }
    let res: WhiteList = [];
    let lastAddress = "";

    while (true) {
      const queryData = Json.toBytes({
        get_complete_meme_data_list: {
          start_after: lastAddress,
          limit: PLAY3_LIST_SIZE,
        },
      });
      try {
        const { data } =
          (await client?.cosmwasm.wasm.v1.smartContractState({
            address: contractAddress,
            queryData,
          })) || {};

        const { data: parsed } =
          Json.fromBytes<{ data: WhiteList }>(data) ?? {};

        if (!parsed || parsed.length === 0) break;
        res = [...res, ...parsed];
        lastAddress = res[res.length - 1].cont_addr;
        if (parsed.length < PLAY3_LIST_SIZE) break;
      } catch {
        return res;
      }
    }
    return res;
  }, [client]);

  const getAuthInfo = useCallback(async () => {
    if (!walletAddress || !client) {
      return undefined;
    }

    const { info } = await client.cosmos.auth.v1beta1.accountInfo({
      address: walletAddress,
    });

    return info;
  }, [walletAddress, client]);

  const estimateFee = useCallback(
    async (msg: EncodeObject[], authSequence: bigint) => {
      if (!msg || !client) {
        return undefined;
      }

      const txBytes = createEncodedTx(msg, authSequence);

      const res = await client?.cosmos.tx.v1beta1.simulate({
        txBytes,
      });

      const fee = await calculateFee(
        { gasUsed: res?.gasInfo?.gasUsed },
        getGasInfo(chainName),
        chainId ? () => Promise.resolve(chainId) : undefined,
      );

      return fee;
    },

    [client],
  );

  return useMemo(
    () => ({
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfos,
      getVerifiedIbcTokenInfos,
      getLatestBlockHeight,
      getDecimal,
      getLockdropEvents,
      getLockdropEventInfo,
      getLockdropUserInfo,
      getEstimatedLockdropReward,
      getPlay3List,
      estimateFee,
      getAuthInfo,
      rpcEndpoint,
      isLoading,
    }),
    [
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfos,
      getVerifiedIbcTokenInfos,
      getLatestBlockHeight,
      getDecimal,
      getLockdropEvents,
      getLockdropEventInfo,
      getLockdropUserInfo,
      getEstimatedLockdropReward,
      getPlay3List,
      estimateFee,
      getAuthInfo,
      rpcEndpoint,
      isLoading,
    ],
  );
};

export default useAPI;
