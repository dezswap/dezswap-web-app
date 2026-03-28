import { accountFromAny } from "@cosmjs/stargate";
import type { AccountParser } from "@cosmjs/stargate";
import type { OfflineAminoSigner } from "@cosmjs/amino";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";

import { SupportedChains } from "~/constants/dezswap";

// ─── Chain detection (Skip-go pattern: getIsEthermint) ───

/** Known cosmos-evm chain IDs — sourced from chain registry keyAlgos/extraCodecs */
const COSMOS_EVM_CHAIN_IDS = new Set(
  SupportedChains.filter(
    (chain) =>
      chain.extraCodecs?.includes("ethermint") ||
      chain.keyAlgos?.includes("ethsecp256k1"),
  ).map((chain) => chain.chainId),
);

/** Detect if a chain uses ethsecp256k1 (cosmos-evm / ethermint) */
export function isCosmosEvmChain(chainId: string): boolean {
  return COSMOS_EVM_CHAIN_IDS.has(chainId);
}

// ─── Signer wrapping (fixes Keplr returning algo: "secp256k1" for ethsecp256k1 chains) ───

/**
 * Wrap an OfflineAminoSigner to override `algo` to "ethsecp256k1".
 *
 * Keplr returns `algo: "secp256k1"` for XPLA even though the chain uses ethsecp256k1.
 * CosmJS's `getAminoPubkey()` checks `algo` to decide pubkey encoding — without
 * "ethsecp256k1", it encodes as `/cosmos.crypto.secp256k1.PubKey` (wrong typeUrl)
 * instead of `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`.
 *
 * This wrapper fixes the algo field so CosmJS encodes the pubkey correctly.
 */
export function wrapSignerForCosmosEvm(
  signer: OfflineAminoSigner,
): OfflineAminoSigner {
  return {
    getAccounts: async () => {
      const accounts = await signer.getAccounts();
      return accounts.map((a) => ({
        ...a,
        algo: "ethsecp256k1" as const,
      }));
    },
    signAmino: signer.signAmino.bind(signer),
  };
}

// ─── AccountParser (Skip-go pattern: accountParser for BaseAccount + ethsecp256k1 pubkey) ───

/**
 * Custom AccountParser for cosmos-evm chains (XPLA, Evmos, etc.)
 * Handles BaseAccount with ethsecp256k1 pubkey typeUrl.
 * Based on skip-go's production implementation (skip-mev/skip-go#1714).
 */
export const cosmosEvmAccountParser: AccountParser = (acc) => {
  if (acc.typeUrl === "/cosmos.auth.v1beta1.BaseAccount") {
    const { address, pubKey, accountNumber, sequence } = BaseAccount.decode(
      acc.value,
    );

    const ethsecp256k1TypeUrls = [
      "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey",
      "/ethermint.crypto.v1.ethsecp256k1.PubKey",
    ];

    if (pubKey && ethsecp256k1TypeUrls.includes(pubKey.typeUrl)) {
      const { key } = PubKey.decode(pubKey.value);
      return {
        address,
        pubkey: {
          type: "tendermint/PubKeySecp256k1",
          value: btoa(String.fromCharCode(...key)),
        },
        accountNumber: Number(accountNumber),
        sequence: Number(sequence),
      };
    }
  }

  return accountFromAny(acc);
};
