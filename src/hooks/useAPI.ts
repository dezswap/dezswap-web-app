import { useCallback, useMemo } from "react";
import { Pair, Pool, ReverseSimulation, Simulation } from "types/pair";
import { useConnectedWallet, useLCDClient } from "@xpla/wallet-provider";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
  queryMessages,
} from "utils/dezswap";
import { Pairs } from "types/factory";
import axios from "axios";
import { TokenInfo } from "types/token";
import { contractAddresses } from "constants/dezswap";
import { useNetwork } from "hooks/useNetwork";
import { LatestBlock } from "types/common";

interface TokenBalance {
  balance: string;
}

interface Decimal {
  decimals: number;
}

export const useAPI = () => {
  const network = useNetwork();
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();
  const walletAddress = useMemo(
    () => connectedWallet?.walletAddress,
    [connectedWallet],
  );

  const getToken = useCallback(
    async (address: string) => {
      const res = await lcd.wasm.contractQuery<TokenInfo>(address, {
        token_info: {},
      });
      return res;
    },
    [lcd],
  );

  const getPairs = useCallback(
    (options?: Parameters<typeof queryMessages.getPairs>[0]) => {
      const contractAddress = contractAddresses[network.name]?.factory;
      if (!contractAddress) {
        return undefined;
      }
      const res = lcd.wasm.contractQuery<Pairs>(
        contractAddress,
        queryMessages.getPairs(options),
      );

      return res;
    },
    [lcd.wasm, network.name],
  );

  const getPair = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress) {
        return undefined;
      }
      const res = await lcd.wasm.contractQuery<Pair>(contractAddress, {
        pair: {},
      });

      return res;
    },
    [lcd],
  );

  const getPool = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress) {
        return undefined;
      }
      const res = await lcd.wasm.contractQuery<Pool>(contractAddress, {
        pool: {},
      });

      return res;
    },
    [lcd],
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
    const { data } = await axios.get("https://assets.xpla.io/cw20/tokens.json");
    return data;
  }, []);

  const getVerifiedIbcTokenInfo = useCallback(async () => {
    const { data } = await axios.get("https://assets.xpla.io/ibc/tokens.json");
    return data;
  }, []);

  const getLatestBlockHeight = useCallback(async () => {
    const { data } = await axios.get<LatestBlock>(
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
    [lcd, walletAddress],
  );

  const api = useMemo(
    () => ({
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
