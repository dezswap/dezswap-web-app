import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InvalidPathModal from "components/Modal/InvalidPathModal";

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
