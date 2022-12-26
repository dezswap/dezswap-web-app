import { css, useTheme } from "@emotion/react";
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
  error?: boolean;
  hasCloseButton?: boolean;
  hasGoBackButton?: boolean;
  noPadding?: boolean;
  overlay?: boolean;
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
  overlay = true,
  error,
  className: _className,
  overlayClassName: _overlayClassName,
  ...modalProps
}: ModalProps) {
  const theme = useTheme();
  const isInnerModal = useMemo(
    () => !!modalProps.parentSelector,
    [modalProps.parentSelector],
  );
  const parentElement = useMemo(
    () => (modalProps.parentSelector ? modalProps.parentSelector() : null),
    [modalProps],
  );

  const overlayClassName = useMemo(() => {
    const additionalClasses = [];
    if (!overlay) {
      additionalClasses.push("no-overlay");
    }
    if (isInnerModal) {
      additionalClasses.push("inner-modal");
    }
    if (additionalClasses.length) {
      if (typeof _overlayClassName === "string" || !_overlayClassName) {
        return `${_overlayClassName || ""} ${additionalClasses.join(" ")}`;
      }
      return {
        ..._overlayClassName,
        base: `${_overlayClassName.base || ""} ${additionalClasses.join(" ")}`,
      };
    }
    return _overlayClassName;
  }, [_overlayClassName, isInnerModal, overlay]);
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
      overlayClassName={overlayClassName}
      closeTimeoutMS={200}
      onRequestClose={onGoBack}
      style={{
        overlay: {
          ...defaultOverlayStyle,
          ...modalProps.style?.overlay,
          ...(isInnerModal
            ? {
                position: "absolute",
                zIndex: "unset",
              }
            : {}),
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
          ${isInnerModal &&
          css`
            padding: 0 !important;
          `}
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
              : {
                  borderColor: error
                    ? theme.colors.danger
                    : theme.colors.primary,
                }),
            maxHeight: parentElement ? parentElement.clientHeight : "80vh",
            overflowY: "auto",
            ...(noPadding && { padding: 0 }),
          }}
        >
          <ModalHeader>
            {typeof title === "string" ? (
              <Typography
                size={20}
                weight={900}
                color={error ? "danger" : "primary"}
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
