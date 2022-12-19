import { css } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Container } from "react-grid-system";
import ReactModal from "react-modal";

import iconClose from "assets/icons/icon-close-28px.svg";
import iconBack from "assets/icons/icon-back.svg";
import { useMemo } from "react";

ReactModal.setAppElement("#root");

interface ModalProps extends ReactModal.Props {
  drawer?: boolean;
  hasCloseButton?: boolean;
  hasGoBackButton?: boolean;
  noPadding?: boolean;
  onGoBack?: React.MouseEventHandler<HTMLButtonElement>;
  title?: React.ReactNode;
}

const defaultContentStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: 0,
  backgroundColor: "transparent",
  width: "100%",
  inset: "unset",
  height: "auto",
  maxWidth: 544,
  border: "none",
};

const defaultOverlayStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  height: "100%",
};

const ModalHeader = styled.div`
  width: 100%;
  height: auto;
  position: sticky;
  left: 0;
  top: 0;
  padding-bottom: 20px;
  z-index: 10;
  &:empty {
    padding-bottom: 0;
  }
  &::before {
    content: "";
    width: 100%;
    height: 200%;
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.white};
    z-index: -1;
  }
`;

function Modal({
  children,
  hasCloseButton,
  hasGoBackButton,
  noPadding,
  onGoBack,
  title,
  drawer,
  className: _className,
  ...modalProps
}: ModalProps) {
  const className = useMemo(() => {
    if (drawer) {
      if (typeof _className === "string" || !_className) {
        return `${_className || ""} bottom-drawer`;
      }
      return {
        ..._className,
        base: `${_className.base || ""} bottom-drawer`,
      };
    }
    return _className;
  }, [_className, drawer]);
  return (
    <ReactModal
      className={className}
      closeTimeoutMS={200}
      onRequestClose={onGoBack}
      style={{
        overlay: {
          ...defaultOverlayStyle,
          ...modalProps.style?.overlay,
        },
        content: {
          ...defaultContentStyle,
          ...modalProps.style?.content,
        },
      }}
      {...modalProps}
    >
      <Container
        css={css`
          width: 100%;
          display: block;
          height: 100%;
        `}
      >
        <Panel
          shadow
          wrapperStyle={
            drawer
              ? {
                  paddingBottom: 0,
                  height: "100%",
                  display: "block",
                }
              : {}
          }
          style={{
            ...(drawer
              ? {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }
              : {}),
            maxHeight: "80vh",
            overflowY: "auto",
            ...(noPadding && { padding: 0 }),
          }}
        >
          <ModalHeader>
            {typeof title === "string" ? (
              <Typography
                size={20}
                weight={900}
                color="primary"
                css={{ textAlign: "center" }}
              >
                {title}
              </Typography>
            ) : (
              title
            )}
            {hasGoBackButton && (
              <IconButton
                icons={{ default: iconBack }}
                size={28}
                css={css`
                  position: absolute;
                  top: 0;
                  left: 0;
                `}
                onClick={onGoBack}
              />
            )}
            {hasCloseButton && (
              <IconButton
                icons={{ default: iconClose }}
                size={28}
                css={css`
                  position: absolute;
                  top: 0;
                  right: 0;
                `}
                onClick={modalProps.onRequestClose}
              />
            )}
          </ModalHeader>
          {children}
        </Panel>
      </Container>
    </ReactModal>
  );
}

export default Modal;
