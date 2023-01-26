import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Box from "components/Box";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";

import usePairBookmark from "hooks/usePairBookmark";
import { useScreenClass } from "react-grid-system";
import iconSortDisabled from "assets/icons/icon-sort-disabled.svg";
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
  overflow-x: auto;

  & > div {
    width: 100%;
    min-width: 1122px;
    position: relative;
    height: auto;

    .${MOBILE_SCREEN_CLASS} &,
    .${TABLET_SCREEN_CLASS} & {
      min-width: unset;
    }
  }
`;

const TableHeader = styled(Box)`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
  padding: 14px 20px;
  margin-bottom: 10px;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    & > img {
      vertical-align: middle;
    }
    &:first-of-type {
      width: 244px;
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
          <div>
            Total Liquidity
            <img src={iconSortDisabled} width={22} alt="sort" />
          </div>
          <div>
            Volume(24H)
            <img src={iconSortDisabled} width={22} alt="sort" />
          </div>
          <div>
            Fees(24H)
            <img src={iconSortDisabled} width={22} alt="sort" />
          </div>
          <div>
            APR
            <img src={iconSortDisabled} width={22} alt="sort" />
          </div>
        </TableHeader>
      )}
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
              padding-top: 25px;
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
      </List>
    </Wrapper>
  );
}

export default PoolList;
