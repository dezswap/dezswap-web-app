import {
  UserDenied,
  Timeout,
  SignBytesFailed,
  CreateTxFailed,
  TxFailed,
  TxUnspecifiedError,
} from "@xpla/wallet-provider";

export type TxError =
  | UserDenied
  | Timeout
  | SignBytesFailed
  | CreateTxFailed
  | TxFailed
  | TxUnspecifiedError;

export type NetworkName = "testnet" | "mainnet";
