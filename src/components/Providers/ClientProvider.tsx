/**
 * Client hooks backed by graz.
 *
 * graz's useCosmWasmClient/useStargateClient return Record<chainId, Client>.
 * These wrappers extract the client for the current chain, keeping the same
 * simple interface (Client | undefined) that consumers expect.
 *
 * No Provider component needed — graz's GrazProvider handles client lifecycle.
 */

import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { StargateClient } from "@cosmjs/stargate";
import {
  useCosmWasmClient as useGrazCosmWasmClient,
  useStargateClient as useGrazStargateClient,
} from "graz";

import { useNetwork } from "~/hooks/useNetwork";

export function useCosmWasmClient(): CosmWasmClient | undefined {
  const { selectedChain } = useNetwork();
  const chainId = selectedChain?.chainId ?? "";
  const { data } = useGrazCosmWasmClient();
  return data?.[chainId] ?? undefined;
}

export function useStargateClient(): StargateClient | undefined {
  const { selectedChain } = useNetwork();
  const chainId = selectedChain?.chainId ?? "";
  const { data } = useGrazStargateClient();
  return data?.[chainId] ?? undefined;
}

export function useClientsLoading(): boolean {
  const { isLoading: cwLoading } = useGrazCosmWasmClient();
  const { isLoading: sgLoading } = useGrazStargateClient();
  return cwLoading || sgLoading;
}
