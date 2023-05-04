import axios from "axios";
import http from "http";
import https from "https";

import { useCallback, useMemo } from "react";
import { Pair, Pool, ReverseSimulation, Simulation } from "types/pair";
import { useConnectedWallet } from "@xpla/wallet-provider";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
  queryMessages,
} from "utils/dezswap";
import { Pairs } from "types/factory";
import { TokenInfo, VerifiedTokenInfo } from "types/token";
import { apiAddresses, contractAddresses } from "constants/dezswap";
import { useNetwork } from "hooks/useNetwork";
import { useLCDClient } from "hooks/useLCDClient";
import { LatestBlock } from "types/common";

interface TokenBalance {
  balance: string;
}

export type ApiVersion = "v1";

interface Decimal {
  decimals: number;
}

export const useAPI = (version: ApiVersion = "v1") => {
  const network = useNetwork();
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();
  const apiClient = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
  const walletAddress = useMemo(
    () => connectedWallet?.walletAddress,
    [connectedWallet],
  );

  const getTokens = useCallback(async () => {
    try {
      const base = apiAddresses[network.name]?.baseUrl || "";
      const { data } = await apiClient.get<(TokenInfo & VerifiedTokenInfo)[]>(
        `${base}/${version}/tokens`,
      );
      return data;
    } catch (err) {
      console.error(err);
    }
    return [];
  }, [lcd, network.name, version]);

  const getToken = useCallback(
    async (address: string) => {
      try {
        const base = apiAddresses[network.name]?.baseUrl || "";
        const { data } = await apiClient.get<TokenInfo & VerifiedTokenInfo>(
          `${base}/${version}/tokens/${address}`,
        );
        return data;
      } catch (err) {
        console.error(err);
      }
      const res = await lcd.wasm.contractQuery<TokenInfo>(address, {
        token_info: {},
      });
      return res;
    },
    [lcd, network.name, version],
  );

  const getPairs = useCallback(
    async (options?: Parameters<typeof queryMessages.getPairs>[0]) => {
      const contractAddress = contractAddresses[network.name]?.factory;
      if (!contractAddress) {
        return undefined;
      }

      try {
        const base = apiAddresses[network.name]?.baseUrl || "";
        const { data } = await apiClient.get<Pairs>(`${base}/${version}/pairs`);
        return data;
      } catch (err) {
        console.error(err);
      }
      const res: Pairs = await lcd.wasm.contractQuery<Pairs>(
        contractAddress,
        queryMessages.getPairs(options),
      );

      return res;
    },
    [lcd.wasm, network.name, version],
  );

  const getPair = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress) {
        return undefined;
      }

      try {
        const base = apiAddresses[network.name]?.baseUrl || "";
        const { data } = await apiClient.get<Pair>(
          `${base}/${version}/pairs/${contractAddress}`,
        );
        return data;
      } catch (err) {
        console.error(err);
      }
      const res = await lcd.wasm.contractQuery<Pair>(contractAddress, {
        pair: {},
      });

      return res;
    },
    [lcd.wasm, network.name, version],
  );

  const getPools = useCallback(async () => {
    try {
      const base = apiAddresses[network.name]?.baseUrl || "";
      const { data } = await apiClient.get<Pool[]>(`${base}/${version}/pools`);
      return data;
    } catch (err) {
      console.error(err);
    }
    return [];
  }, [network.name, version]);

  const getPool = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress) {
        return undefined;
      }

      try {
        const base = apiAddresses[network.name]?.baseUrl || "";
        const { data } = await apiClient.get<Pool>(
          `${base}/${version}/pools/${contractAddress}`,
        );
        return data;
      } catch (err) {
        console.error(err);
      }
      const res: Pool = await lcd.wasm.contractQuery<Pool>(
        contractAddress,
        queryMessages.getPool(),
      );

      return res;
    },
    [lcd.wasm, network.name, version],
  );

  const simulate = useCallback(
    async (contractAddress: string, offerAsset: string, amount: string) => {
      const res = await lcd.wasm.contractQuery<Simulation>(
        contractAddress,
        generateSimulationMsg(network.name, offerAsset, amount),
      );
      return res;
    },
    [lcd, network.name],
  );

  const reverseSimulate = useCallback(
    async (contractAddress: string, askAsset: string, amount: string) => {
      const res = await lcd.wasm.contractQuery<ReverseSimulation>(
        contractAddress,
        generateReverseSimulationMsg(network.name, askAsset, amount),
      );
      return res;
    },
    [lcd, network.name],
  );

  const getNativeTokenBalance = useCallback(
    async (denom: string) => {
      if (!denom || !walletAddress) {
        return undefined;
      }
      const res = await lcd.bank.balance(walletAddress, {
        "pagination.limit": "9999",
      });

      if (res && res[0]) {
        return res[0].get(denom) ? res[0].get(denom)?.amount.toString() : "0";
      }

      return undefined;
    },
    [lcd, walletAddress],
  );

  const getTokenBalance = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress || !walletAddress) {
        return undefined;
      }
      const res = await lcd.wasm.contractQuery<TokenBalance>(contractAddress, {
        balance: { address: walletAddress },
      });
      return res.balance;
    },
    [lcd, walletAddress],
  );

  const getVerifiedTokenInfo = useCallback(async () => {
    const { data } = await apiClient.get(
      "https://assets.xpla.io/cw20/tokens.json",
    );
    return data;
  }, []);

  const getVerifiedIbcTokenInfo = useCallback(async () => {
    const { data } = await apiClient.get(
      "https://assets.xpla.io/ibc/tokens.json",
    );
    return data;
  }, []);

  const getLatestBlockHeight = useCallback(async () => {
    const { data } = await apiClient.get<LatestBlock>(
      `${network.lcd}/blocks/latest`,
    );
    return data.block.header.height;
  }, [network.lcd]);

  const getDecimal = useCallback(
    async (denom: string) => {
      const contractAddress = contractAddresses[network.name]?.factory;
      if (!contractAddress || !denom) {
        return undefined;
      }
      const res = await lcd.wasm.contractQuery<Decimal>(contractAddress, {
        native_token_decimals: { denom },
      });
      return res.decimals;
    },
    [network.name, lcd, walletAddress],
  );

  const api = useMemo(
    () => ({
      getTokens,
      getToken,
      getPairs,
      getPair,
      getPool,
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfo,
      getVerifiedIbcTokenInfo,
      getLatestBlockHeight,
      getDecimal,
    }),
    [
      getTokens,
      getToken,
      getPairs,
      getPair,
      getPool,
      simulate,
      reverseSimulate,
      getNativeTokenBalance,
      getTokenBalance,
      getVerifiedTokenInfo,
      getVerifiedIbcTokenInfo,
      getLatestBlockHeight,
      getDecimal,
    ],
  );

  return api;
};
