import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Container, useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";

import iconClose from "assets/icons/icon-close-28px.svg";
import iconBack from "assets/icons/icon-back.svg";
import { useEffect, useMemo, useState } from "react";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";

import SimpleBar from "simplebar/dist";

ReactModal.setAppElement("#root");

interface ModalProps extends Omit<ReactModal.Props, "style"> {
  drawer?: boolean;
  error?: boolean;
  gradient?: boolean;
  hasCloseButton?: boolean;
  hasGoBackButton?: boolean;
  noPadding?: boolean;
  overlay?: boolean;
  onGoBack?: React.MouseEventHandler<HTMLButtonElement>;
  title?: React.ReactNode;
  style?: ReactModal.Props["style"] & {
    panel?: React.CSSProperties;
    header?: React.CSSProperties;
  };
  headerExtra?: React.ReactNode;
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

const ModalHeader = styled(Panel)`
  width: 100%;
  height: auto;
  position: sticky;
  left: 0;
  top: 0;
  margin-bottom: 20px;

  z-index: 100;
  &:has(div:empty) {
    padding: 0;
  }
  .${MOBILE_SCREEN_CLASS} &,
  & {
    padding-bottom: 0;
  }
  & > div {
    width: 100%;
    height: auto;
    position: relative;
  }
`;

ModalHeader.defaultProps = {
  border: false,
};

const removeClassName = () => {
  if (!document.querySelector(".ReactModal__Content")) {
    document.body.classList.remove("ReactModal__Body--open");
  }
};

function Modal({
  isOpen,
  children,
  hasCloseButton,
  hasGoBackButton,
  noPadding,
  onGoBack,
  title,
  drawer,
  overlay = true,
  error,
  gradient,
  style,
  headerExtra,
  contentRef: _contentRef,
  className: _className,
  overlayClassName: _overlayClassName,
  onAfterClose,
  ...modalProps
}: ModalProps) {
  const theme = useTheme();
  const screenClass = useScreenClass();
  const isInnerModal = useMemo(
    () => !!modalProps.parentSelector,
    [modalProps.parentSelector],
  );
  const elParent = useMemo(() => {
    return modalProps.parentSelector?.();
  }, [modalProps]);

  const [elContent, setElContent] = useState<HTMLDivElement>();

  useEffect(() => {
    const originalMinHeight = elParent?.style.minHeight;
    const handleResize = () => {
      if (elParent && elContent) {
        elParent.style.setProperty("min-height", `${elContent.scrollHeight}px`);
      }
    };
    handleResize();
    let resizeObserver: ResizeObserver;
    if (elContent) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(elContent);
    }

    return () => {
      if (elParent) {
        elParent.style.setProperty("min-height", originalMinHeight || "");
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [elParent, elContent]);

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

  const [resizeTrigger, setResizeTrigger] = useState(false);

  useEffect(() => {
    setResizeTrigger(true);
  }, [screenClass]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (resizeTrigger) {
        setResizeTrigger(false);
      }
    }, 100);
    return () => {
      clearTimeout(timerId);
    };
  }, [resizeTrigger]);

  useEffect(() => {
    const handleModalPop = () => {
      const simpleBar = SimpleBar.instances.get(document.body);
      if (simpleBar?.onWindowResize) {
        simpleBar.onWindowResize();
        setTimeout(() => {
          simpleBar.onWindowResize();
        }, MODAL_CLOSE_TIMEOUT_MS + 100);
      }

      if (simpleBar?.recalculate) {
        simpleBar.recalculate();
        setTimeout(() => {
          simpleBar.recalculate();
        }, MODAL_CLOSE_TIMEOUT_MS + 100);
      }
    };

    handleModalPop();
    return () => {
      handleModalPop();
    };
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={resizeTrigger ? false : isOpen}
      className={className}
      overlayClassName={overlayClassName}
      closeTimeoutMS={MODAL_CLOSE_TIMEOUT_MS}
      onRequestClose={onGoBack}
      onAfterClose={() => {
        removeClassName();
        if (onAfterClose) {
          onAfterClose();
        }
      }}
      style={{
        overlay: {
          ...defaultOverlayStyle,
          ...(isInnerModal
            ? {
                position: "absolute",
                zIndex: "unset",
                alignItems: "flex-start",
              }
            : {}),
          ...style?.overlay,
        },
        content: {
          ...defaultContentStyle,
          ...style?.content,
        },
      }}
      contentRef={(instance) => {
        if (_contentRef) {
          _contentRef(instance);
        }
        setElContent(instance);
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
            :not(.ReactModalPortal .ReactModalPortal &) {
              padding: 0 !important;
            }
          `}
        `}
      >
        <Panel
          shadow
          noPadding
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
            borderColor: error ? theme.colors.danger : theme.colors.primary,
            ...(gradient
              ? {
                  backgroundImage: `linear-gradient(#fff, #fff), ${theme.colors.gradient}`,
                  borderImageSlice: 1,
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  border: "3px solid transparent",
                }
              : {}),
            maxHeight: "80vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            ...style?.panel,
          }}
        >
          <ModalHeader style={style?.header}>
            <div>
              {typeof title === "string" ? (
                <Typography
                  size={20}
                  weight={900}
                  color={error ? "danger" : "primary"}
                  css={css`
                    ${gradient &&
                    css`
                      background-image: ${theme.colors.gradient};
                      background-clip: text;
                      color: transparent;
                    `}
                    text-align: center;
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  `}
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
              {(hasCloseButton || headerExtra) && (
                <div
                  css={css`
                    position: absolute;
                    top: 50%;
                    right: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transform: translateY(-50%);
                    .${MOBILE_SCREEN_CLASS} & {
                      gap: 2px;
                    }
                  `}
                >
                  {headerExtra}
                  {hasCloseButton && (
                    <IconButton
                      icons={{ default: iconClose }}
                      size={28}
                      onClick={modalProps.onRequestClose}
                    />
                  )}
                </div>
              )}
            </div>
          </ModalHeader>
          <Panel
            border={false}
            wrapperCss={css`
              &::-webkit-scrollbar-track {
                margin-bottom: 10px;
              }
            `}
            noPadding={noPadding}
            style={{
              paddingTop: 0,
            }}
            wrapperStyle={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {children}
          </Panel>
        </Panel>
      </Container>
    </ReactModal>
  );
}

export default Modal;
