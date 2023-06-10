import {
  UserDenied,
  Timeout,
  SignBytesFailed,
  CreateTxFailed,
  TxFailed,
  TxUnspecifiedError,
} from "@xpla/wallet-provider";
import { Pair } from "types/pair";

export type TxError =
  | UserDenied
  | Timeout
  | SignBytesFailed
  | CreateTxFailed
  | TxFailed
  | TxUnspecifiedError;

export type NetworkName = "testnet" | "mainnet";

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
