import { useState } from "react";

export const useModal = (defaultOption = false) => {
  const [isOpen, setIsOpen] = useState(defaultOption);

  const open = (state = true) => setIsOpen(state);
  const close = () => open(false);
  const toggle = () => setIsOpen((current) => !current);

  return { isOpen, open, close, toggle };
};
