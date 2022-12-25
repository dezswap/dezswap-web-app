import { useSetAtom } from "jotai";
import React, { useEffect, useId } from "react";
import globalElementsAtom from "stores/globalElements";

const useGlobalElement = (element: React.ReactNode) => {
  const id = useId();
  const setModals = useSetAtom(globalElementsAtom);

  useEffect(() => {
    setModals((current) => [...current, { id, element }]);
    return () => {
      setModals((current) => current.filter((item) => item.id !== id));
    };
  }, [element, id, setModals]);
};

export default useGlobalElement;
