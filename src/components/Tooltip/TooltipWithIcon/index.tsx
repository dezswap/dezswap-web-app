import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { TippyProps } from "@tippyjs/react";
import iconQuestion from "assets/icons/icon-question.svg";
import Tooltip from "components/Tooltip";

interface TooltipWithIconProps {
  size?: number | string;
}

const Icon = styled.div<TooltipWithIconProps>`
  ${({ size: _size }) => {
    const size = typeof _size === "number" ? `${_size}px` : _size;
    return css`
      width: ${size};
      height: ${size};
      min-width: ${size};
      min-height: ${size};
    `;
  }}
  position: relative;
  display: inline-block;
  background-image: url(${iconQuestion});
  background-size: contain;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  vertical-align: middle;

  font-size: 0;
  transform: translateY(-1px);
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
