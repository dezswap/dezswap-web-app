import Tippy, { TippyProps } from "@tippyjs/react";
import { ComponentRef, forwardRef, useEffect } from "react";
import { hideAll } from "tippy.js";

function handleScroll() {
  const elTippyList = document.querySelectorAll("[data-tippy-root]");
  if (elTippyList.length && (document.activeElement as HTMLElement).blur) {
    (document.activeElement as HTMLElement).blur();
    document.body.focus();
  }
  hideAll();
}

const Tooltip = forwardRef<ComponentRef<typeof Tippy>, TippyProps>(
  function Tooltip({ children, ...props }, ref) {
    useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("touchmove", handleScroll);

      // No need to remove event listener since the browser does not add duplicate event listeners
    }, []);

    return (
      <Tippy
        ref={ref}
        maxWidth="250px"
        arrow
        {...props}
        theme="light-border"
        duration={0}
      >
        {children}
      </Tippy>
    );
  },
);

export default Tooltip;
