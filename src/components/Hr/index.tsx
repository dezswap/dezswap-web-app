import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CSSProperties } from "react";
import colors, { Colors } from "styles/theme/colors";

type Color = keyof Colors;

interface HrProps {
  color?: Color | string;
  size?: CSSProperties["borderWidth"];
}

const Hr = styled.div<HrProps>`
  width: 100%;
  height: 0;
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};

  ${({ color = colors.primary, theme }) => css`
    border-color: ${theme.colors[color as Color] ?? color};
  `}

  ${({ size = 1 }) => css`
    border-bottom-width: ${typeof size === "number" ? `${size}px` : size};
  `}
`;

export default Hr;
