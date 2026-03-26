import { fromBase64 } from "@interchainjs/encoding";
import { describe, expect, it } from "vitest";

import { Json } from "../../src/utils/encode";

describe("Json.toBytes", () => {
  it("encodes a simple object to Uint8Array", () => {
    const result = Json.toBytes({ pool: {} });
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toBe('{"pool":{}}');
  });

  it("encodes nested objects", () => {
    const input = {
      increase_allowance: {
        amount: "1000000",
        spender: "xpla1abc",
      },
    };
    const result = Json.toBytes(input);
    const decoded = JSON.parse(new TextDecoder().decode(result));
    expect(decoded).toEqual(input);
  });

  it("handles unicode characters", () => {
    const input = { name: "토큰" };
    const result = Json.toBytes(input);
    const decoded = Json.fromBytes(result);
    expect(decoded).toEqual(input);
  });

  it("handles empty object", () => {
    const result = Json.toBytes({});
    expect(new TextDecoder().decode(result)).toBe("{}");
  });
});

describe("Json.fromBytes", () => {
  it("decodes Uint8Array back to JSON", () => {
    const bytes = new TextEncoder().encode('{"pool":{}}');
    const result = Json.fromBytes(bytes);
    expect(result).toEqual({ pool: {} });
  });

  it("decodes array values", () => {
    const input = { assets: [{ amount: "100" }, { amount: "200" }] };
    const bytes = new TextEncoder().encode(JSON.stringify(input));
    const result = Json.fromBytes(bytes);
    expect(result).toEqual(input);
  });

  it("round-trips with Json.encode", () => {
    const input = {
      simulation: {
        offer_asset: {
          info: { native_token: { denom: "axpla" } },
          amount: "1000000",
        },
      },
    };
    expect(Json.fromBytes(Json.toBytes(input))).toEqual(input);
  });

  it("supports generic type parameter", () => {
    type SwapMsg = { swap: { max_spread: string } };
    const bytes = new TextEncoder().encode(
      JSON.stringify({ swap: { max_spread: "0.01" } }),
    );
    const result = Json.fromBytes<SwapMsg>(bytes);
    expect(result.swap.max_spread).toBe("0.01");
  });
});

describe("Json.toBase64", () => {
  it("encodes a swap message to base64", () => {
    const msg = {
      swap: {
        max_spread: "0.0010",
        belief_price: "1.5",
        deadline: 1700000000,
      },
    };
    const result = Json.toBase64(msg);
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64(result)));
    expect(decoded).toEqual(msg);
  });

  it("encodes withdraw_liquidity message", () => {
    const msg = {
      withdraw_liquidity: {
        min_assets: [
          { info: { native_token: { denom: "axpla" } }, amount: "100" },
        ],
        deadline: 1700001200,
      },
    };
    const result = Json.toBase64(msg);
    expect(JSON.parse(new TextDecoder().decode(fromBase64(result)))).toEqual(
      msg,
    );
  });

  it("encodes increase_lockup message", () => {
    const msg = { increase_lockup: { duration: 86400 } };
    const result = Json.toBase64(msg);
    expect(JSON.parse(new TextDecoder().decode(fromBase64(result)))).toEqual(
      msg,
    );
  });
});
