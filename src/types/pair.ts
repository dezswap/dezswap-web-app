export type Asset = {
  token: {
    contract_addr: string;
  };
};

export type NativeAsset = {
  native_token: {
    denom: string;
  };
};

export type Simulation = {
  return_amount: string;
  spread_amount: string;
  commission_amount: string;
};

export type ReverseSimulation = {
  offer_amount: string;
  spread_amount: string;
  commission_amount: string;
};
