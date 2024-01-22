import { css } from "@emotion/react";
import styled from "@emotion/styled";
import iconOutlink from "assets/icons/icon-link.svg";

interface OutlinkProps {
  iconSize?: number;
}

const Outlink = styled.a<OutlinkProps>`
  display: inline-block;
  line-height: 19px;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  &::after {
    content: "";
    display: inline-block;
    ${({ iconSize = 16 }) => css({ width: iconSize, height: iconSize })}
    position: relative;
    margin-left: 5px;
    background-image: url(${iconOutlink});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    line-height: 19px;
    vertical-align: middle;
  }

  &:empty::after {
    margin-left: 0;
  }
`;

Outlink.defaultProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export default Outlink;
