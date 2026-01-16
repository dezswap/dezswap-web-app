import Tippy, { TippyProps } from "@tippyjs/react";
import {
  ComponentRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Tooltip from "~/components/Tooltip";

interface OverflowTooltipProps extends Omit<TippyProps, "children"> {
  children: TippyProps["children"] | string;
}

const OverflowTooltip = forwardRef<
  ComponentRef<typeof Tippy>,
  OverflowTooltipProps
>(function OverflowTooltip(
  { disabled: disabledFromProps, content, children, ...props },
  refFromProps,
) {
  const [disabled, setDisabled] = useState(false);
  const tooltipRef = useRef<Element>(null);
  useImperativeHandle(refFromProps, () => tooltipRef.current as Element);

  useEffect(() => {
    const handleResize = () => {
      const parentElement = tooltipRef.current?.parentElement;
      if (parentElement) {
        setDisabled(parentElement.clientWidth >= parentElement.scrollWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [props]);

  return (
    <Tooltip
      ref={tooltipRef}
      disabled={disabledFromProps ?? disabled}
      content={content || children}
      {...props}
    >
      {typeof children === "string" ? <span>{children}</span> : children}
    </Tooltip>
  );
});

export default OverflowTooltip;
