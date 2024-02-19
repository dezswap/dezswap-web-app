import { Numeric as XplaNumeric } from "@xpla/xpla.js";

type CustomNumericOptions = {
  throwOnError?: boolean;
};

declare module "@xpla/xpla.js" {
  namespace Numeric {
    function parse(
      value: XplaNumeric.Input,
      options?: CustomNumericOptions,
    ): XplaNumeric.Output;
  }
}
