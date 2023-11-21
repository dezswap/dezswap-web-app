import Box from "components/Box";
import iconExpand from "assets/icons/icon-expand.svg";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Hr from "components/Hr";
import { useEffect, useState } from "react";
import {
  LARGE_BROWSER_SCREEN_CLASS,
  MOBILE_SCREEN_CLASS,
  SMALL_BROWSER_SCREEN_CLASS,
  TABLET_SCREEN_CLASS,
} from "constants/layout";

type ExpandProps = React.PropsWithChildren<{
  header?: React.ReactNode;
  extra?: React.ReactNode | React.ReactNode[];
  isOpen?: boolean;
  hasDivider?: boolean;
  onHeaderClick?: React.MouseEventHandler<HTMLDivElement>;
}>;

const Wrapper = styled(Box)`
  padding: 0;
  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    padding-top: 2px;
    padding-bottom: 30px;
  }
`;

const Header = styled(Box)<{ hasChildren?: boolean }>`
  position: relative;
  padding: 0;
  padding-right: 20px;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    position: unset;
    padding-right: 0;
  }

  ${({ hasChildren, theme }) =>
    hasChildren &&
    css`
      .${SMALL_BROWSER_SCREEN_CLASS} &,
      .${LARGE_BROWSER_SCREEN_CLASS} & {
        &:hover {
          background-color: ${theme.colors.selected};
        }
      }
    `}
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

    &:empty {
      display: none;
    }
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    top: unset;
    bottom: 0;
    right: 50%;
    transform: translateX(50%) translateX(-4px);
    padding: 16px;
  }
`;

const Content = styled.div`
  display: flex;
  padding: 20px;
  padding-top: 0;
`;

function Expand({
  header,
  extra,
  hasDivider = true,
  isOpen: isOpenFromProps,
  onHeaderClick,
  children,
}: ExpandProps) {
  const [isOpen, setIsOpen] = useState(!!isOpenFromProps);

  useEffect(() => {
    setIsOpen(!!isOpenFromProps);
  }, [isOpenFromProps]);

  return (
    <Wrapper>
      <Header
        hasChildren={!!children}
        onClick={(event) => {
          setIsOpen((current) => !current);
          if (onHeaderClick) {
            onHeaderClick(event);
          }
        }}
        role="button"
        css={
          isOpen &&
          css`
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          `
        }
      >
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
          {children && (
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
          )}
        </Extra>
      </Header>
      {isOpen && (
        <>
          {hasDivider && (
            <Hr
              css={css`
                width: auto;
                margin: 20px;
                margin-top: 0px;
              `}
            />
          )}
          <Content
            css={css`
              overflow-x: auto;
              &::-webkit-scrollbar-track {
                margin: 5px;
              }
              .${MOBILE_SCREEN_CLASS} &,
              .${TABLET_SCREEN_CLASS} & {
                overflow-x: unset;
              }
            `}
          >
            {children}
          </Content>
        </>
      )}
    </Wrapper>
  );
}

export default Expand;
