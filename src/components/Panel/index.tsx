import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { PropsWithChildren } from "react";

interface StyledPanelProps {
  shadow?: boolean;
  border?: boolean;
  noPadding?: boolean;
}

type PanelProps = PropsWithChildren<
  StyledPanelProps &
    React.HTMLAttributes<HTMLDivElement> & {
      wrapperStyle?: React.CSSProperties;
    }
>;

const DESKTOP_SHADOW_OFFSET = 12;
const MOBILE_SHADOW_OFFSET = 6;

const Wrapper = styled.div<StyledPanelProps>`
  width: 100%;
  height: auto;
  position: relative;
  ${({ shadow }) =>
    shadow &&
    css`
      padding-right: ${`${DESKTOP_SHADOW_OFFSET}px`};
      padding-bottom: ${`${DESKTOP_SHADOW_OFFSET}px`};

      .${MOBILE_SCREEN_CLASS} & {
        padding-right: ${`${MOBILE_SHADOW_OFFSET}px`};
        padding-bottom: ${`${MOBILE_SHADOW_OFFSET}px`};
      }
    `}
`;

const Content = styled.div<StyledPanelProps>`
  width: 100%;
  height: auto;
  position: relative;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;

  ${({ noPadding }) =>
    !noPadding &&
    css`
      padding: 25px;
      .${MOBILE_SCREEN_CLASS} & {
        padding: 16px;
      }
    `}

  ${({ border, theme }) =>
    border &&
    css`
      border: 3px solid ${theme.colors.primary};
    `}

  ${({ shadow }) =>
    shadow &&
    css`
      box-shadow: ${`${DESKTOP_SHADOW_OFFSET}px`}
        ${`${DESKTOP_SHADOW_OFFSET}px`} 0px #000000;

      .${MOBILE_SCREEN_CLASS} & {
        box-shadow: ${`${MOBILE_SHADOW_OFFSET}px`}
          ${`${MOBILE_SHADOW_OFFSET}px`} 0px #000000;
      }
    `}
`;

function Panel({
  children,
  style,
  wrapperStyle,
  shadow,
  border = true,
  ...divProps
}: PanelProps) {
  return (
    <Wrapper shadow={shadow} style={wrapperStyle}>
      <Content {...divProps} shadow={shadow} border={border} style={style}>
        {children}
      </Content>
    </Wrapper>
  );
}

export default Panel;
