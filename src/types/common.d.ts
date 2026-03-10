import {
  CreateTxFailed,
  SignBytesFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  UserDenied,
} from "@xpla/wallet-provider";

import { Pair } from "~/types/pair";

export interface NetworkInfo {
  chainName: string;
  // TODO: resolve Chain, HttpEndpoint types
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

export interface PairExtended extends Pair {
  asset_addresses: string[];
}

export interface BlockHeader {
  height: string;
}

export interface BlockInfo {
  header: BlockHeader;
}

export interface LatestBlock {
  blockId: string;
  block: BlockInfo;
}
