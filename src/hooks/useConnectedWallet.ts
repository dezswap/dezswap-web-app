import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useDisconnect } from "graz";

import {
  LegacyConnectType,
  type LegacyTxResult,
  convertCosmosArgsToTxOptions,
  useConnectedLegacyWallet,
  useLegacyWallet,
} from "~/utils/legacy";
import type { CosmosSignArgs } from "~/utils/legacy";
import type { Optional, Prettify } from "~/utils/type";
import { isCosmosEvmChain, wrapSignerForCosmosEvm } from "~/utils/cosmos-evm";

import { useNetwork } from "./useNetwork";

type TxResultResult = Prettify<
  Optional<Omit<LegacyTxResult["result"], "height">, "raw_log">
>;

interface TxResult {
  success: boolean;
  result: TxResultResult;
}

interface UseConnectedWalletReturnType {
  walletAddress: string;
  connection: {
    name?: string;
    icon?: string;
  };
  connectType: LegacyConnectType;
  post: (args: CosmosSignArgs) => Promise<TxResult>;
  disconnect: () => void;
}

/**
 * Create a SigningCosmWasmClient using Amino-only signer.
 *
 * For cosmos-evm chains (XPLA), wraps the signer to fix the `algo` field
 * so CosmJS encodes the pubkey with the correct ethsecp256k1 typeUrl.
 * Detection is chain-registry based (Skip-go pattern), not Keplr-dependent.
 */
async function createAminoSigningClient(
  chainId: string,
  rpcUrl: string,
  gasPrice: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keplr = (window as any).keplr;
  if (!keplr) return null;

  let aminoSigner = keplr.getOfflineSignerOnlyAmino(chainId);

  // Skip-go pattern: detect cosmos-evm from chain registry, not from Keplr's algo field
  if (isCosmosEvmChain(chainId)) {
    aminoSigner = wrapSignerForCosmosEvm(aminoSigner);
  }

  return SigningCosmWasmClient.connectWithSigner(rpcUrl, aminoSigner, {
    gasPrice: GasPrice.fromString(gasPrice),
  });
}

export const useConnectedWallet = ():
  | UseConnectedWalletReturnType
  | undefined => {
  const connectedLegacyWallet = useConnectedLegacyWallet();
  const legacyWallet = useLegacyWallet();

  const { selectedChain, rpcUrl } = useNetwork();
  const chainId = selectedChain?.chainId ?? "";

  const { data: accounts, isConnected, walletType } = useAccount();
  const { disconnect } = useDisconnect();

  const feeToken = selectedChain?.fees?.feeTokens?.[0];
  const gasPriceStr = feeToken
    ? `${feeToken.averageGasPrice ?? 850000000000}${feeToken.denom}`
    : "850000000000axpla";

  const { data: signingClient } = useQuery({
    queryKey: ["aminoSigningClient", chainId, rpcUrl, isConnected],
    queryFn: () => createAminoSigningClient(chainId, rpcUrl, gasPriceStr),
    enabled: isConnected && !!chainId && !!rpcUrl,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (connectedLegacyWallet) {
    return {
      ...connectedLegacyWallet,
      post: (args: CosmosSignArgs) =>
        connectedLegacyWallet.post(convertCosmosArgsToTxOptions(args)),
      disconnect: legacyWallet.disconnect,
    };
  }

  if (!isConnected || !chainId) {
    return undefined;
  }

  const accountKey = accounts?.[chainId];
  const walletAddress = accountKey?.bech32Address;

  if (!walletAddress) {
    return undefined;
  }

  const walletTypeStr = walletType ?? "";
  const connection = {
    name: walletTypeStr,
    icon: undefined as string | undefined,
  };

  const connectType =
    walletTypeStr === "walletconnect"
      ? LegacyConnectType.WALLETCONNECT
      : LegacyConnectType.EXTENSION;

  const post = async (args: CosmosSignArgs): Promise<TxResult> => {
    if (!signingClient) {
      throw new Error("Signing client not ready");
    }
    const postResult = await signingClient.signAndBroadcast(
      walletAddress,
      args.messages,
      args.fee ?? "auto",
      args.memo,
    );

    return {
      success: postResult.code === 0,
      result: {
        txhash: postResult.transactionHash,
        raw_log: postResult.rawLog,
      },
    };
  };

  return {
    walletAddress,
    connection,
    post,
    connectType,
    disconnect: () => disconnect(),
  };
};
