import { css } from "@emotion/react";
import styled from "@emotion/styled";

import Typography from "~/components/Typography";

import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "~/constants/layout";

import useLockdropBookmark from "~/hooks/useLockdropBookmark";

import { LockdropEvent, LockdropUserInfo } from "~/types/lockdrop";

import LockdropEventItem from "./LockdropEventItem";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;

  & > div {
    width: 100%;
    position: relative;
    height: auto;

    .${MOBILE_SCREEN_CLASS} &,
    .${TABLET_SCREEN_CLASS} & {
      min-width: unset;
    }
  }
`;
const List = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  min-height: 157px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    min-height: 78px;
  }
`;

function LockdropEventList({
  events: lockdropEvents,
  userInfos: lockdropUserInfos,
  emptyMessage = "No event found.",
  isUpcoming,
}: {
  events?: LockdropEvent[];
  userInfos?: (LockdropUserInfo | undefined)[];
  emptyMessage?: string;
  isUpcoming?: boolean;
}) {
  const { bookmarks, toggleBookmark } = useLockdropBookmark();

  return (
    <Wrapper>
      <List>
        {!lockdropEvents?.length && (
          <div
            css={css`
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 100%;
              height: auto;
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
              {emptyMessage}
            </Typography>
          </div>
        )}
        {lockdropEvents?.map((lockdropEvent, index) => (
          <LockdropEventItem
            key={lockdropEvent.id}
            event={lockdropEvent}
            isBookmarked={bookmarks?.includes(lockdropEvent.addr)}
            onBookmarkToggle={() => toggleBookmark(lockdropEvent.addr)}
            userInfo={lockdropUserInfos?.[index]}
            isUpcoming={isUpcoming}
          />
        ))}
      </List>
    </Wrapper>
  );
}

export default LockdropEventList;
