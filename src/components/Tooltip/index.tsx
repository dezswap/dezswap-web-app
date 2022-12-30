import Tippy, { TippyProps } from "@tippyjs/react";

function Tooltip({ children, ...props }: TippyProps) {
  return (
    <Tippy
      maxWidth="250px"
      arrow={false}
      {...props}
      theme="light-border"
      duration={0}
    >
      {children}
    </Tippy>
  );
}

export default Tooltip;
