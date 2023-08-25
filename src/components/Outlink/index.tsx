import styled from "@emotion/styled";
import iconOutlink from "assets/icons/icon-link.svg";

const Outlink = styled.a`
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
    width: 16px;
    height: 16px;
    position: relative;
    margin-left: 5px;
    background-image: url(${iconOutlink});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    line-height: 19px;
    vertical-align: middle;
  }
`;

Outlink.defaultProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export default Outlink;
