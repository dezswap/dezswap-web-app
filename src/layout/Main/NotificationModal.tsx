import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Hr from "components/Hr";
import Modal from "components/Modal";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useNotifications from "hooks/useNotifications";
import React, { useEffect, useState } from "react";
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
  const { notifications, markAsRead } = useNotifications();
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<Notification["id"]>();

  const selectedNotification = notifications.find(
    (notification) => notification.id === selectedNotificationId,
  );

  useEffect(() => {
    setSelectedNotificationId(undefined);
  }, [modalProps.isOpen]);

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
      {!selectedNotificationId &&
        notifications.map((notification) => (
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
              {notification.title}
            </Typography>
            <Typography size={14} weight={700} color="primary">
              {notification.description}
            </Typography>
            <Typography size={12} weight={500} color="primary">
              {formatDateTime(notification.date)}
            </Typography>
          </NotificationItem>
        ))}

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
            {selectedNotification?.date &&
              formatDateTime(selectedNotification.date)}
          </Typography>
          <Typography size={14} weight={700} color="primary">
            {selectedNotification?.description.split("\n").map((item) => (
              <div>{item}</div>
            ))}
          </Typography>
        </Panel>
      )}
    </Modal>
  );
}

export default NotificationModal;
