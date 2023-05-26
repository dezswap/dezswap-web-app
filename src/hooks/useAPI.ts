import axios from "axios";

import { useCallback, useMemo } from "react";
import { ReverseSimulation, Simulation } from "types/pair";
import { useConnectedWallet } from "@xpla/wallet-provider";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
} from "utils/dezswap";
import { VerifiedAssets, VerifiedIbcAssets } from "types/token";
import { contractAddresses } from "constants/dezswap";
import useNetwork from "hooks/useNetwork";
import useLCDClient from "hooks/useLCDClient";
import { LatestBlock } from "types/common";
import api, { ApiVersion } from "api";

interface TokenBalance {
  balance: string;
}

interface Decimal {
  decimals: number;
}

const useAPI = (version: ApiVersion = "v1") => {
  const network = useNetwork();
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();
  const walletAddress = useMemo(
    () => connectedWallet?.walletAddress,
    [connectedWallet],
  );

  const apiClient = useMemo(
    () => api(network.name, version),
    [network.name, version],
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
    [network.name, lcd],
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
      getDecimal,
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
      getDecimal,
    ],
  );
};

export default useAPI;
