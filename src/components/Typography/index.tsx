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

interface RecursiveKeyValue {
  [key: string]: string | RecursiveKeyValue;
}
const getTypographyColorRecursive = (
  from: RecursiveKeyValue | undefined,
  color: string | undefined,
): string | undefined => {
  if (!color || !from) return undefined;
  if (typeof from[color as Color] === "string") {
    return `${from[color as Color]}`;
  }
  return getTypographyColorRecursive(
    from[color.split(".")[0]] as RecursiveKeyValue,
    color.split(".").slice(1).join("."),
  );
};

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
    color: ${getTypographyColorRecursive(theme.colors, color) ?? color};
  `}

  
  ${({ size = 14 }) => css`
    font-size: ${typeof size === "number" ? `${size}px` : size};
  `}
`;

export default Typography;
