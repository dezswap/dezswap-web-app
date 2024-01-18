import styled from "@emotion/styled";

const Wrapper = styled.div`
  width: auto;
  height: auto;
  position: relative;
  display: inherit;

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
}> &
  React.ComponentProps<typeof Wrapper>;

function HoverUnderline({
  children,
  color: borderBottomColor,
  ...wrapperProps
}: HoverUnderlineProps) {
  return (
    <Wrapper css={{ borderBottomColor }} {...wrapperProps}>
      {children}
    </Wrapper>
  );
}

export default HoverUnderline;
