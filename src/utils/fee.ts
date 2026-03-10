import { GasPrice, calculateFee } from "@interchainjs/cosmos";
import type { StdFee } from "@interchainjs/types";
import { Coin, Fee } from "@xpla/xpla.js";
import Decimal from "decimal.js";

import { GAS_INFO } from "~/constants/dezswap";
import { XPLA_ADDRESS } from "~/constants/network";

export const calculateFeeWithGasInfo = (gasLimit: number | bigint) => {
  return calculateFee(
    Decimal(gasLimit).mul(GAS_INFO.multiplier).ceil().toNumber(),
    new GasPrice(GAS_INFO.gasPrice.amount, GAS_INFO.gasPrice.denom),
  );
};

export const getXplaFeeAmount = (fee?: StdFee) => {
  const xplaCoin = fee?.amount.find((coin) => coin.denom === XPLA_ADDRESS);
  return xplaCoin ? xplaCoin.amount : "0";
};

export const convertStdFeeToLegacyFee = (stdFee: StdFee): Fee => {
  return new Fee(
    Number(stdFee.gas),
    stdFee.amount.map((coin) => new Coin(coin.denom, coin.amount)),
  );
};
