import { useCallback, useMemo, useState } from "react";

export const useModal = (defaultOption = false) => {
  const [isOpen, setIsOpen] = useState(defaultOption);

  const open = useCallback((state = true) => setIsOpen(state), []);
  const close = useCallback(() => open(false), [open]);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  return useMemo(
    () => ({ isOpen, open, close, toggle }),
    [close, isOpen, open, toggle],
  );
};
