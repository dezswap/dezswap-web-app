import Tippy, { TippyProps } from "@tippyjs/react";

const DISPLAY_TIMEOUT_MS = 1000;

function Tooltip({ children, ...props }: TippyProps) {
  return (
    <Tippy
      maxWidth="250px"
      arrow={false}
      onShow={(instance) => {
        setTimeout(() => {
          instance.hide();
        }, DISPLAY_TIMEOUT_MS);
      }}
      {...props}
      theme="light-border"
    >
      {children}
    </Tippy>
  );
}

export default Tooltip;
