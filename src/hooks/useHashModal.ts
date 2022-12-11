import { useId, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useHashModal = (customId?: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const generatedId = useId();

  const hookId = useMemo(() => {
    return customId ?? generatedId;
  }, [customId, generatedId]);

  const isOpen = useMemo(() => {
    return location.hash === `#${hookId}`;
  }, [location, hookId]);

  const open = (flag = true) => {
    if (flag) {
      if (!isOpen) {
        navigate({ hash: hookId });
      }
      return;
    }
    navigate({ hash: undefined });
  };

  const close = () => open(false);

  return { isOpen, open, close };
};

export default useHashModal;
