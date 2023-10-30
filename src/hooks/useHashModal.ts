import { useCallback, useId, useMemo } from "react";
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

  const open = useCallback(
    (flag = true) => {
      if (flag) {
        if (!isOpen) {
          navigate({ ...location, hash: hookId });
        }
        return;
      }
      navigate({ ...location, hash: undefined });
    },
    [hookId, isOpen, location, navigate],
  );

  const close = useCallback(() => open(false), [open]);

  return { isOpen, open, close };
};

export default useHashModal;
