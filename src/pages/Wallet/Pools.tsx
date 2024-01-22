import { useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Table from "components/Table";
import useBalances from "hooks/useBalances";
import usePairBookmark from "hooks/usePairBookmark";
import usePairs from "hooks/usePairs";
import usePools from "hooks/usePools";
import { Pool } from "types/api";
import Pagination from "components/Pagination";
import { Col, Row, useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import PoolItem from "./PoolItem";

type PoolWithBalance = Pool & {
  balance?: string;
};

const tabs = [
  {
    label: "My Pools",
    value: "my-pools",
  },
  {
    label: "Bookmarks",
    value: "bookmarks",
  },
];

const LIMIT = 5;

function Pools() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const [selectedTabIndex, setSelectedIndex] = useState(0);
  const { getPair } = usePairs();
  const { pools } = usePools();
  const { bookmarks, toggleBookmark } = usePairBookmark();
  const balances = useBalances(
    pools?.map((pool) => getPair(pool.address)?.liquidity_token || "") || [],
  );
  const [page, setPage] = useState(1);

  const poolsWithBalance = useMemo<PoolWithBalance[]>(() => {
    return (
      pools?.map((pool) => ({
        ...pool,
        balance: balances.find(
          (item) => item?.address === getPair(pool.address)?.liquidity_token,
        )?.balance,
      })) || []
    );
  }, [balances, getPair, pools]);

  const userPools = useMemo<PoolWithBalance[]>(() => {
    return (
      poolsWithBalance.filter((item) =>
        Numeric.parse(item?.balance || "0").gt(0),
      ) || []
    );
  }, [poolsWithBalance]);

  const bookmarkedPools = useMemo<PoolWithBalance[]>(() => {
    return (
      bookmarks?.map((address) => {
        return poolsWithBalance.find((item) => item?.address === address);
      }) || []
    ).filter((pool): pool is PoolWithBalance => !!pool);
  }, [bookmarks, poolsWithBalance]);

  const selectedPools = useMemo(
    () => (selectedTabIndex === 0 ? userPools : bookmarkedPools),
    [bookmarkedPools, selectedTabIndex, userPools],
  );

  const poolsToDisplay = useMemo(() => {
    return selectedPools.slice((page - 1) * LIMIT, page * LIMIT);
  }, [selectedPools, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedTabIndex, pools]);

  return (
    <Panel shadow>
      <Row justify={screenClass === "xs" ? "center" : "start"}>
        <Col xs="content">
          <div
            css={css`
              width: 214px;
              margin-bottom: 25px;
            `}
          >
            <TabButton
              size="large"
              selectedIndex={selectedTabIndex}
              items={tabs}
              onChange={(idx) => setSelectedIndex(idx)}
            />
          </div>
        </Col>
      </Row>
      <div
        css={css`
          margin-bottom: 25px;
        `}
      >
        <Table
          idKey="address"
          minWidth={!isSmallScreen ? 1110 : undefined}
          columns={[{ key: "none", label: "Pool", hasSort: false }]} // TODO: add sort
          hideHeader={isSmallScreen}
          data={poolsToDisplay}
          emptyMessage={
            ["No pool found", "No bookmark found"][selectedTabIndex]
          }
          renderRow={(row) => (
            <PoolItem
              pool={row}
              isBookmarked={
                bookmarks &&
                bookmarks?.findIndex((address) => address === row.address) >= 0
              }
              onBookmarkClick={(item) => {
                toggleBookmark(item.address);
              }}
            />
          )}
        />
      </div>
      {selectedPools.length > LIMIT && (
        <Pagination
          current={page}
          total={Math.ceil(selectedPools.length / LIMIT)}
          onChange={(newPage) => setPage(newPage)}
        />
      )}
    </Panel>
  );
}

export default Pools;
