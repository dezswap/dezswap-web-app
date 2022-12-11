import { useScreenClass } from "react-grid-system";

function useMobileSize() {
  const screenClass = useScreenClass();
  const isMobile = ["xs", "sm"].includes(screenClass);
  return isMobile;
}

export default useMobileSize;
