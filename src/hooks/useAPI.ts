import axios from "axios";

import { useCallback, useMemo } from "react";

import {
  createEncodedTx,
  generateReverseSimulationMsg,
  generateSimulationMsg,
  getQueryData,
  parseJsonFromBinary,
} from "utils/dezswap";
import type { VerifiedAssets, VerifiedIbcAssets, WhiteList } from "types/token";
import { contractAddresses, GAS_INFO } from "constants/dezswap";
import { calculateFee } from "@interchainjs/cosmos";
import useNetwork from "hooks/useNetwork";
import Decimal from "decimal.js";
import api, { ApiVersion } from "api";
import { EncodeObject } from "@xpla/xplajs/types";
import { LockdropUserInfo } from "types/lockdrop";
import useRPCClient from "./useRPCClient";
import useConnectedWallet from "./useConnectedWallet";

const PLAY3_LIST_SIZE = 20;

const useAPI = (version: ApiVersion = "v1") => {
  const { chainName } = useNetwork();
  const { client, rpcEndpoint, isLoading } = useRPCClient();
  const { walletAddress } = useConnectedWallet();
  const apiClient = useMemo(
    () => api(chainName, version),
    [chainName, version],
  );

  const simulate = useCallback(
    async (contractAddress: string, offerAsset: string, amount: string) => {
      if (!client) return undefined;
      const queryData = getQueryData(generateSimulationMsg(offerAsset, amount));
      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return parseJsonFromBinary(data);
    },
    [client],
  );

  const reverseSimulate = useCallback(
    async (contractAddress: string, askAsset: string, amount: string) => {
      if (!client) return undefined;

      const queryData = getQueryData(
        generateReverseSimulationMsg(askAsset, amount),
      );

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return parseJsonFromBinary(data);
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

      const queryData = getQueryData({
        balance: { address: walletAddress },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      const res = parseJsonFromBinary(data);

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

  // unused func
  // const getDecimal = useCallback(
  //   async (denom: string) => {
  //     const contractAddress = contractAddresses[chainName]?.factory;
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

  //     const { data: res } = await client.cosmwasm.wasm.v1.smartContractState({
  //       address: contractAddress,
  //       queryData,
  //     });
  //     const tokenDecimals = parseJsonFromBinary(res) as unknown as Decimal;
  //     return tokenDecimals.decimals;
  //   },
  //   [chainName, client],
  // );

  const getLockdropEvents = useCallback(
    async (startAfter = 0) => {
      const contractAddress = contractAddresses?.[chainName]?.lockdrop;
      if (!contractAddress || !client) {
        return undefined;
      }

      const queryData = getQueryData({
        events_by_end: { start_after: startAfter },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: contractAddress,
        queryData,
      });

      return parseJsonFromBinary(data);
    },
    [client, chainName],
  );

  const getLockdropEventInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!client) return undefined;

      const queryData = getQueryData({
        event_info: {},
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return parseJsonFromBinary(data);
    },
    [client],
  );

  const getLockdropUserInfo = useCallback(
    async (lockdropEventAddress: string) => {
      if (!walletAddress || !lockdropEventAddress || !client) {
        return undefined;
      }

      const queryData = getQueryData({
        user_info: {
          addr: walletAddress,
        },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return parseJsonFromBinary(data) as LockdropUserInfo;
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

      const queryData = getQueryData({
        estimate: {
          amount: `${amount}`,
          duration,
        },
      });

      const { data } = await client.cosmwasm.wasm.v1.smartContractState({
        address: lockdropEventAddress,
        queryData,
      });

      return parseJsonFromBinary(data);
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
      const queryData = getQueryData({
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

        const { data: parsed } = parseJsonFromBinary(data) ?? {};

        if (!parsed || parsed.length === 0) break;
        res = [...res, ...parsed];
        lastAddress = res[res.length - 1].cont_addr;
        if (parsed.length < PLAY3_LIST_SIZE) break;
      } catch (e) {
        return res;
      }
    }
    return res;
  }, [client]);

  const getAuthInfo = useCallback(async () => {
    if (!walletAddress || !client) {
      return undefined;
    }
    const { info } =
      (await client?.cosmos.auth.v1beta1.accountInfo({
        address: walletAddress,
      })) || {};
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

      if (!res?.gasInfo?.gasUsed) {
        throw new Error("Gas used not found");
      }

      const gasLimit = BigInt(
        Math.ceil(Number(res.gasInfo.gasUsed) * GAS_INFO.multiplier),
      );
      const fee = await calculateFee(gasLimit, GAS_INFO.gasPrice);
      return fee;
    },
    [client],
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
      getPlay3List,
      estimateFee,
      getAuthInfo,
      rpcEndpoint,
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
      getPlay3List,
      estimateFee,
      getAuthInfo,
      rpcEndpoint,
      isLoading,
    ],
  );
};

export default useAPI;
