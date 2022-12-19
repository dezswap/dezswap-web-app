import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CSSProperties } from "react";

interface HrProps {
  size?: CSSProperties["borderWidth"];
}

const Hr = styled.div<HrProps>`
  width: 100%;
  height: 0;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary};

  ${({ size = 2 }) => css`
    border-width: ${typeof size === "number" ? size / 2 : 1}px;
  `}
`;

export default Hr;
