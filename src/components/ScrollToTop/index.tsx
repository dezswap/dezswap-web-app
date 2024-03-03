import { PropsWithChildren, useEffect } from "react";

function ScrollToTop({ children }: PropsWithChildren) {
  useEffect(() => {
    window.scrollTo(0, 1); // scroll to top but 1 pixel down to hide the address bar
  }, []);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default ScrollToTop;
