import Box from "components/Box";
import iconExpand from "assets/icons/icon-expand.svg";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Hr from "components/Hr";
import { useState } from "react";

type ExpandProps = React.PropsWithChildren<{
  header?: React.ReactNode;
  extra?: React.ReactNode | React.ReactNode[];
  isOpen?: boolean;
}>;

const Wrapper = styled(Box)`
  padding: 0;
  &:hover {
    background-color: ${({ theme }) => theme.colors.selected};
  }
`;

const Header = styled.div`
  position: relative;
`;

const Extra = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 20px;
  &,
  & > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const Content = styled.div`
  padding: 20px;
  padding-top: 0;
`;

function Expand({ header, extra, isOpen: defaultOpen, children }: ExpandProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Wrapper onClick={() => setIsOpen((current) => !current)}>
      <Header>
        {header}
        <Extra>
          <div
            aria-hidden
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {extra}
          </div>
          <div>
            <div
              css={css`
                width: 18px;
                height: 18px;
                background-image: url(${iconExpand});
                background-size: contain;
                background-repeat: no-repeat;
                background-position: 50% 50%;
                transform: rotate(${isOpen ? 180 : 0}deg);
                margin-left: 2px;
              `}
            />
          </div>
        </Extra>
      </Header>
      {isOpen && (
        <Content>
          <Hr
            css={css`
              margin-bottom: 20px;
            `}
          />
          {children}
        </Content>
      )}
    </Wrapper>
  );
}

export default Expand;
