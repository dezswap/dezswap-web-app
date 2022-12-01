import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { CSSProperties } from "react";
import colors, { Colors } from "styles/theme/colors";

type Color = keyof Colors;

interface TypographyProps {
  color?: Color | string;
  size?: CSSProperties["fontSize"];
  weight?: CSSProperties["fontWeight"];
}

const Typography = styled.div<TypographyProps>`
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;

  ${({ weight = 500 }) => css`
    font-weight: ${weight};
  `}

  ${({ color = colors.text.primary, theme }) => css`
    color: ${theme.colors[color as Color] ?? color};
  `}

  
  ${({ size = 14 }) => css`
    font-size: ${typeof size === "number" ? `${size}px` : size};
  `}
`;

export default Typography;
