import { QuerySmartContractStateResponse } from "@xpla/xplajs/cosmwasm/wasm/v1/query";
import { createLCDClient } from "@xpla/xplajs/xpla/lcd";

type OriginalLCDClient = Awaited<ReturnType<typeof createLCDClient>>;

export type CustomLCDClient = OriginalLCDClient & {
  cosmwasm: {
    wasm: {
      v1: {
        smartContractState: (params: {
          address: string;
          queryData: string;
        }) => Promise<QuerySmartContractStateResponse>;
      };
    };
  };
};

export interface TokenBalance {
  balance: string;
}

// interface Decimal extends Uint8Array {
//   decimals: number;
// }
