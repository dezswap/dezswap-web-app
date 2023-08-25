import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";

import usePairBookmark from "hooks/usePairBookmark";
import { Pool } from "types/api";
import PoolItem from "./PoolItem";

interface PoolListProps {
  pools: Pool[];
  emptyMessage?: string;
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
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

function PoolList({
  pools,
  emptyMessage = "The pool doesn’t exist. Create a new pool.",
}: PoolListProps) {
  const { bookmarks, toggleBookmark } = usePairBookmark();
  return (
    <Wrapper>
      <List>
        {!pools.length && (
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
        {pools.map((pool) => {
          return (
            <PoolItem
              key={pool?.address}
              pool={pool}
              bookmarked={bookmarks?.includes(pool.address)}
              onBookmarkClick={() => toggleBookmark(pool.address)}
            />
          );
        })}
      </List>
    </Wrapper>
  );
}

export default PoolList;
