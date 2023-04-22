import { PropsWithChildren, useEffect } from "react";
import SimpleBar from "simplebar/dist";

function ScrollToTop({ children }: PropsWithChildren) {
  useEffect(() => {
    try {
      const simpleBar = SimpleBar.instances.get(document.body);
      const scrollElement = simpleBar?.getScrollElement?.();
      if (scrollElement) {
        scrollElement.scrollTop = 0;
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default ScrollToTop;
