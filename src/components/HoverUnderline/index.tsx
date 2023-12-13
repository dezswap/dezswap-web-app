import styled from "@emotion/styled";

const Wrapper = styled.div`
  width: auto;
  height: auto;
  position: relative;
  display: inline-block;

  &:hover::after {
    content: "";
    left: 0;
    top: 100%;
    width: 100%;
    height: 0;
    position: absolute;
    padding-bottom: 1px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  }
`;

type HoverUnderlineProps = React.PropsWithChildren<{
  color?: React.CSSProperties["borderBottomColor"];
}>;

function HoverUnderline({
  children,
  color: borderBottomColor,
}: HoverUnderlineProps) {
  return <Wrapper css={{ borderBottomColor }}>{children}</Wrapper>;
}

export default HoverUnderline;
