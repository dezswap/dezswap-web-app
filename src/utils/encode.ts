import {
  toBase64 as bytesToBase64,
  fromUtf8,
  toUtf8,
} from "@cosmjs/encoding";

/**
 * JSON encoding/decoding utilities.
 *
 * - `toBytes`: object → Uint8Array (ex. contract `msg` field)
 * - `fromBytes`: Uint8Array → parsed object (ex. query responses)
 * - `toBase64`: object → base64 string (ex. CW20 send inner msg)
 */
export const Json = {
  toBytes(value: object): Uint8Array {
    return toUtf8(JSON.stringify(value));
  },

  fromBytes<T>(data: Uint8Array): T {
    return JSON.parse(fromUtf8(data));
  },

  toBase64(value: object): string {
    return bytesToBase64(toUtf8(JSON.stringify(value)));
  },
} as const;
