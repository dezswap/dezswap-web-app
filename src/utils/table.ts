import { Numeric } from "@xpla/xpla.js";
import { TableSortDirection } from "components/Table";

export const getBasicSortFunction = <R extends object>(
  key: keyof R,
  direction: TableSortDirection,
) => {
  return (a: R, b: R) => {
    const valueA = a[key];
    const valueB = b[key];
    const returnValue = direction === "desc" ? -1 : 1;
    if (valueA === valueB) {
      return 0;
    }

    if (Number.isNaN(Number(valueA)) || Number.isNaN(Number(valueB))) {
      return valueA > valueB ? returnValue : -returnValue;
    }

    return Numeric.parse(`${valueA}`).gt(`${valueB}`)
      ? returnValue
      : -returnValue;
  };
};
