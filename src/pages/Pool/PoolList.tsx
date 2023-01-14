import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Box from "components/Box";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";

import usePairBookmark from "hooks/usePairBookmark";
import { useScreenClass } from "react-grid-system";
import { PoolExtended } from ".";
import PoolItem from "./PoolItem";

interface PoolListProps {
  pools: PoolExtended[];
  emptyMessage?: string;
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* overflow-x: auto;
  & > div {
    width: auto;
    min-width: 100%;
  } */
`;

const TableHeader = styled(Box)`
  /* width: auto;
  min-width: 100%; */
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 14px 20px;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    &:first-of-type {
      width: 244px;
    }
  }
`;

function PoolList({
  pools,
  emptyMessage = "The pool doesn’t exist. Create a new pool.",
}: PoolListProps) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { bookmarks, toggleBookmark } = usePairBookmark();
  return (
    <Wrapper>
      {!isSmallScreen && (
        <TableHeader>
          <div>Pool</div>
          <div>Total Liquidity</div>
          <div>Volume(24H)</div>
          <div>Fees(24H)</div>
          <div>APR</div>
        </TableHeader>
      )}
      {!pools.length && (
        <div
          css={css`
            padding: 120px 0;
            .${MOBILE_SCREEN_CLASS} &,
            .${TABLET_SCREEN_CLASS} & {
              padding: 48px 0;
            }
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
            key={pool?.pair?.contract_addr}
            pool={pool}
            bookmarked={bookmarks?.includes(pool.pair.contract_addr)}
            onBookmarkClick={() => toggleBookmark(pool.pair.contract_addr)}
          />
        );
      })}
    </Wrapper>
  );
}

export default PoolList;
