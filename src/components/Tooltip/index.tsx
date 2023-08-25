import Tippy, { TippyProps } from "@tippyjs/react";
import imgTooltipArrow from "assets/images/img-tooltip-arrow.svg";

let svgAsString = "";
fetch(imgTooltipArrow)
  .then((response) => response.text())
  .then((svg) => {
    svgAsString = svg;
  });

function Tooltip({ children, ...props }: TippyProps) {
  return (
    <Tippy
      maxWidth="250px"
      arrow={svgAsString}
      {...props}
      theme="light-border"
      duration={0}
    >
      {children}
    </Tippy>
  );
}

export default Tooltip;
