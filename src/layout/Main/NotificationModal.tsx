import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Hr from "components/Hr";
import Modal from "components/Modal";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { SupportedChain, supportedChains } from "constants/dezswap";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
import useNotifications from "hooks/useNotifications";
import { useEffect, useRef, useState } from "react";
import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import { Notification } from "stores/notifications";
import { formatDateTime } from "utils";

const NotificationItem = styled.button`
  width: 100%;
  height: auto;
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 16px 20px;
  text-align: left;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
  }
`;

function NotificationModal(modalProps: ReactModal.Props) {
  const screenClass = useScreenClass();
  const bottomDivRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, fetchMore, hasNextPage } =
    useNotifications();
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<Notification["id"]>();

  const selectedNotification = notifications.find(
    (notification) => notification.id === selectedNotificationId,
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!modalProps.isOpen) {
        setSelectedNotificationId(undefined);
      }
    }, MODAL_CLOSE_TIMEOUT_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [modalProps.isOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      },
    );

    const timerId = setTimeout(() => {
      if (bottomDivRef.current && hasNextPage && modalProps.isOpen) {
        observer.observe(bottomDivRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timerId);
      observer.disconnect();
    };
  }, [fetchMore, hasNextPage, modalProps]);

  return (
    <Modal
      {...modalProps}
      overlay
      title={
        selectedNotificationId ? selectedNotification?.title : "Notifications"
      }
      hasCloseButton
      noPadding
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      style={{
        panel: {
          height: 504,
          position: "relative",
        },
      }}
      hasGoBackButton={!!selectedNotificationId}
      onGoBack={() => setSelectedNotificationId(undefined)}
    >
      <Panel
        border={false}
        wrapperStyle={{
          position: "sticky",
          zIndex: 1,
          top: 0,
        }}
        style={{
          padding: 20,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <Hr />
      </Panel>
      {!selectedNotificationId && !notifications?.length && (
        <div
          css={css`
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
          `}
        >
          <Typography
            css={css`
              text-align: center;
              opacity: 0.3;
            `}
            size={20}
            weight={900}
          >
            No data
          </Typography>
        </div>
      )}
      {!selectedNotificationId && (
        <>
          {!!notifications?.length &&
            notifications.map((notification) => {
              const chain =
                supportedChains[notification.chain as SupportedChain];
              return (
                <NotificationItem
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    setSelectedNotificationId(notification.id);
                  }}
                  css={css`
                    & > * {
                      width: 100%;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      white-space: nowrap;
                    }

                    ${notification.isRead &&
                    css`
                      opacity: 0.5;
                    `}
                  `}
                >
                  <Typography size={16} weight={900} color="primary">
                    {chain && !chain?.isMainnet ? (
                      <span
                        css={css`
                          color: #ff8255;
                        `}
                      >
                        [{chain.name}
                        ]&nbsp;
                      </span>
                    ) : null}
                    {notification.title}
                  </Typography>
                  <Typography size={14} weight={700} color="primary">
                    {notification.description}
                  </Typography>
                  <Typography size={12} weight={500} color="primary">
                    {formatDateTime(notification.timestamp)}
                  </Typography>
                </NotificationItem>
              );
            })}
          <div
            ref={bottomDivRef}
            css={css`
              opacity: 0;
            `}
            style={{ display: hasNextPage ? "block" : "none" }}
          >
            bottom
          </div>
        </>
      )}

      {selectedNotificationId && (
        <Panel border={false}>
          <Typography
            size={16}
            weight={900}
            color="primary"
            css={css`
              margin-bottom: 4px;
            `}
          >
            {selectedNotification?.title}
          </Typography>
          <Typography
            size={12}
            weight={500}
            color="primary"
            css={css`
              margin-bottom: 16px;
            `}
          >
            {selectedNotification?.timestamp &&
              formatDateTime(selectedNotification.timestamp)}
          </Typography>
          <Typography
            size={14}
            weight={700}
            color="primary"
            css={css`
              white-space: pre-line;
            `}
          >
            {selectedNotification?.description}
          </Typography>
        </Panel>
      )}
    </Modal>
  );
}

export default NotificationModal;
