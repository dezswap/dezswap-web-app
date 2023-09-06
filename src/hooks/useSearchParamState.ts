import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import {
  NavigateOptions,
  useLocation,
  useSearchParams,
} from "react-router-dom";

const useSearchParamState = <S extends string>(
  paramName: string,
  defaultValue?: S,
  navigateOptions?: NavigateOptions,
): [S | undefined, Dispatch<S | undefined>] => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState<S | undefined>(
    (searchParams.get(paramName) as S | null) || defaultValue,
  );
  const setSearchParam = useCallback<Dispatch<S | undefined>>(
    (newValue) => {
      setSearchParams(
        (current) => {
          current.delete(paramName);
          if (newValue !== undefined) {
            current.set(paramName, newValue);
          }
          return current;
        },
        { replace: true, ...navigateOptions },
      );
    },
    [navigateOptions, paramName, setSearchParams],
  );

  useEffect(() => {
    if (value !== (searchParams.get(paramName) || undefined)) {
      setSearchParam(value);
    }
  }, [paramName, searchParams, setSearchParam, value, location]);

  return [value, setValue];
};

export default useSearchParamState;
