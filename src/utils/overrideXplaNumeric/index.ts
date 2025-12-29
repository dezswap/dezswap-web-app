import { Numeric } from "@xpla/xpla.js";

import { type CustomNumericOptions } from "~/types/@xpla/xpla.js";

const originalNumericParse = Numeric.parse;
Numeric.parse = (value, options: CustomNumericOptions = {}) => {
  try {
    return originalNumericParse(value);
  } catch (error) {
    if (options?.throwOnError) {
      throw error;
    }
    console.log(error);
  }
  return originalNumericParse(0);
};
