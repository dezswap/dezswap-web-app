import { useCallback } from "react";
import type { To } from "react-router-dom";

import { CHAIN_NAME_SEARCH_PARAM } from "constants/dezswap";
import useNetwork from "./useNetwork";

export const useFormatTo = () => {
  const { chainName } = useNetwork();
  const formatTo = useCallback(
    ({ to }: { to: To }) => {
      let searchString: string | undefined;
      let pathname = "/";
      let hash: string | undefined;

      if (typeof to === "string") {
        const [pathAndHash, rawSearch] = to.split("?");
        const [rawPath, rawHash] = pathAndHash.split("#");

        pathname = rawPath || "/";
        hash = rawHash ? `#${rawHash}` : undefined;
        searchString = rawSearch ? `?${rawSearch}` : undefined;
      } else {
        pathname = to.pathname || "/";
        hash = to.hash;
        searchString = to.search;
      }

      const searchParams = new URLSearchParams(searchString);
      searchParams.set(CHAIN_NAME_SEARCH_PARAM, String(chainName));
      const search = `?${searchParams.toString()}`;

      return {
        pathname,
        search,
        ...(hash ? { hash } : {}),
      };
    },
    [chainName],
  );

  return { formatTo };
};
