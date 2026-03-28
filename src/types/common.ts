import type { Chain } from "@chain-registry/types";
import type { HttpEndpoint } from "@cosmjs/stargate";
import type {
  CreateTxFailed,
  SignBytesFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  UserDenied,
} from "@xpla/wallet-provider";

export interface NetworkInfo {
  chainName: string;
  selectedChain: Chain;
  rpcUrl: string | HttpEndpoint;
}

export type TxError =
  | UserDenied
  | Timeout
  | SignBytesFailed
  | CreateTxFailed
  | TxFailed
  | TxUnspecifiedError;
