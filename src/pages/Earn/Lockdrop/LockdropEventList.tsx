import { LockdropEvent, LockdropUserInfo } from "types/lockdrop";

import { css } from "@emotion/react";
import useLockdropBookmark from "hooks/useLockdropBookmark";
import LockdropEventItem from "./LockdropEventItem";

function LockdropEventList({
  events: lockdropEvents,
  userInfos: lockdropUserInfos,
}: {
  events?: LockdropEvent[];
  userInfos?: (LockdropUserInfo | undefined)[];
}) {
  const { bookmarks, toggleBookmark } = useLockdropBookmark();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 10px;
      `}
    >
      {lockdropEvents?.map((lockdropEvent, index) => (
        <LockdropEventItem
          key={lockdropEvent.id}
          event={lockdropEvent}
          isBookmarked={bookmarks?.includes(lockdropEvent.addr)}
          onBookmarkToggle={() => toggleBookmark(lockdropEvent.addr)}
          userInfo={lockdropUserInfos?.[index]}
        />
      ))}
    </div>
  );
}

export default LockdropEventList;
