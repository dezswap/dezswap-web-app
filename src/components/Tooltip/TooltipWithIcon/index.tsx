import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { TippyProps } from "@tippyjs/react";
import iconInfo from "assets/icons/icon-info.svg";
import Tooltip from "components/Tooltip";

interface TooltipWithIconProps {
  size?: number | string;
}

const Icon = styled.div<TooltipWithIconProps>`
  ${({ size }) => {
    if (typeof size === "number") {
      return css`
        width: ${size}px;
        height: ${size}px;
      `;
    }
    return css`
      width: ${size};
      height: ${size};
    `;
  }}
  position: relative;
  display: inline-block;
  background-image: url(${iconInfo});
  background-size: contain;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  vertical-align: middle;
`;

function TooltipWithIcon({
  size = 13.33,
  children,
  ...tippyProps
}: React.PropsWithChildren<TippyProps & TooltipWithIconProps>) {
  return (
    <>
      {children && <>{children}&nbsp;</>}
      <Tooltip {...tippyProps}>
        <Icon size={size} />
      </Tooltip>
    </>
  );
}

export default TooltipWithIcon;
