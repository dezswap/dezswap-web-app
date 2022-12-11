import Tippy, { TippyProps } from "@tippyjs/react";

function Tooltip({ children, ...props }: TippyProps) {
  return (
    <Tippy arrow={false} {...props} theme="light-border">
      {children}
    </Tippy>
  );
}

export default Tooltip;
