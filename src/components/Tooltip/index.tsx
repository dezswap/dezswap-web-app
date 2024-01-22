import Tippy, { TippyProps } from "@tippyjs/react";
import { useEffect } from "react";
import SimpleBar from "simplebar";
import { hideAll } from "tippy.js";

function handleScroll() {
  const elTippyList = document.querySelectorAll("[data-tippy-root]");
  if (elTippyList.length && (document.activeElement as HTMLElement).blur) {
    (document.activeElement as HTMLElement).blur();
    document.body.focus();
  }
  hideAll();
}

function Tooltip({ children, ...props }: TippyProps) {
  useEffect(() => {
    const simpleBar = SimpleBar.instances.get(document.body);

    window.addEventListener("scroll", handleScroll);
    try {
      simpleBar.getScrollElement().addEventListener("scroll", handleScroll);
    } catch (error) {
      console.log(error);
    }

    // No need to remove event listener since the browser does not add duplicate event listeners
  }, []);

  return (
    <Tippy maxWidth="250px" arrow {...props} theme="light-border" duration={0}>
      {children}
    </Tippy>
  );
}

export default Tooltip;
