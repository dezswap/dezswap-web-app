import { useCallback } from "react";
import { useLocation } from "react-router-dom";

import InvalidPathModal from "~/components/Modal/InvalidPathModal";

import { useNavigate } from "~/hooks/useNavigate";

function Error404() {
  const location = useLocation();
  const navigate = useNavigate();
  const handleReturnClick = useCallback(() => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      const path = location.pathname.split("/")[0];
      navigate(path, { replace: true });
    }
  }, [location.pathname, navigate]);

  return <InvalidPathModal isOpen onReturnClick={handleReturnClick} />;
}

export default Error404;
