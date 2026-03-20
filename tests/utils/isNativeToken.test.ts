import { describe, expect, it } from "vitest";

import { isNativeToken } from "../../src/utils";

describe("isNativeToken", () => {
  const ibcDenom =
    "ibc/FC6C34533ECF1AAD296E41A70D8F16089E90D436904B56EDE19342D6DE172B82";
  const axplaDenom = "axpla";
  const xplaBech32 =
    "xpla15jugk3w42q4a06df4p4tfqx5jnlrk2rg0c3sqj3ch0nhwyhj28ysyn8ckk";
  const xerc20Denom = "xerc20:26D086423f64d339481f379F8988004B4fcaB093";
  const prefix = "xpla";

  it("returns true for IBC denom (ibc/<hash>)", () => {
    expect(isNativeToken(ibcDenom, prefix)).toBe(true);
  });

  it("returns true for non-bech32 denom like 'axpla'", () => {
    expect(isNativeToken(axplaDenom, prefix)).toBe(true);
  });

  it("returns false for local bech32 address token (xpla1...)", () => {
    expect(isNativeToken(xplaBech32, prefix)).toBe(false);
  });

  it("returns true for xerc20:<addr> denom", () => {
    expect(isNativeToken(xerc20Denom, prefix)).toBe(true);
  });
});
