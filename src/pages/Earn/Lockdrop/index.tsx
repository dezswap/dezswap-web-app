import { css } from "@emotion/react";
import ScrollToTop from "components/ScrollToTop";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { useEffect, useMemo, useState } from "react";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Switch from "components/Switch";
import { Outlet, useLocation } from "react-router-dom";
import useLockdropEvents from "hooks/useLockdropEvents";
import Pagination from "components/Pagination";
import useAPI from "hooks/useAPI";
import { useQueries } from "@tanstack/react-query";
import { Numeric } from "@xpla/xpla.js";
import useLockdropBookmark from "hooks/useLockdropBookmark";
import usePairs from "hooks/usePairs";
import { LockdropEvent } from "types/lockdrop";
import styled from "@emotion/styled";
import Box from "components/Box";

import iconSortDefault from "assets/icons/icon-sort-default.svg";
import iconSortAsc from "assets/icons/icon-sort-asc.svg";
import iconSortDesc from "assets/icons/icon-sort-desc.svg";
import IconButton from "components/IconButton";
import AssetSelector from "../AssetSelector";
import LockdropEventList from "./LockdropEventList";

const sortIcons = {
  default: iconSortDefault,
  asc: iconSortAsc,
  desc: iconSortDesc,
};

const TableHeader = styled(Box)`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 14px 20px;
  margin-bottom: 10px;
  gap: 20px;

  & > div {
    width: 240px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    & > img {
      vertical-align: middle;
    }
  }
`;

const LIMIT = 10;

function LockdropPage() {
  const location = useLocation();

  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { lockdropEvents: originalLockdropEvents } = useLockdropEvents();
  const api = useAPI();
  const { findPair } = usePairs();

  const lockdropEvents = useMemo(() => {
    return originalLockdropEvents.map((lockdropEvent, index) => ({
      ...lockdropEvent,
      index,
    }));
  }, [originalLockdropEvents]);

  const lockdropUserInfoResults = useQueries({
    queries: lockdropEvents.map((lockdropEvent) => ({
      queryKey: ["lockdropEvent", lockdropEvent.addr],
      queryFn: async () => {
        const res = await api.getLockdropUserInfo(lockdropEvent.addr);
        if (!res) {
          return null;
        }
        return res;
      },

      enabled: !!lockdropEvent.addr,
      refetchInterval: 30000,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    })),
  });

  const lockdropUserInfos = lockdropUserInfoResults.map(
    (result) => result.data || undefined,
  );

  const balances = useQueries({
    queries:
      lockdropEvents?.map((item) => ({
        queryKey: ["balance", item.lp_token_addr],
        queryFn: async () => {
          const balance = await api.getTokenBalance(item.lp_token_addr);
          return balance;
        },
        enabled: !!item.lp_token_addr,
        refetchInterval: 30000,
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      })) || [],
  }).map((item) => item.data);

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isLiveOnly, setIsLiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { bookmarks } = useLockdropBookmark();

  const selectedPair = useMemo(() => {
    const address1 = addresses?.[0] || "";
    const address2 = addresses?.[1] || "";
    return findPair([address1, address2]);
  }, [addresses, findPair]);

  const filteredLockdropEvents = lockdropEvents.filter(
    (lockdropEvent, index) => {
      if (
        isLiveOnly &&
        lockdropEvent.end_at + 52 * 7 * 60 * 60 * 24 < Date.now() / 1000
      ) {
        return false;
      }
      if (selectedPair) {
        return lockdropEvent.lp_token_addr === selectedPair.liquidity_token;
      }
      if (selectedTabIndex === 1) {
        return Numeric.parse(
          lockdropUserInfos[index]?.user_total_locked_lp_token || 0,
        ).gt(0);
      }
      if (selectedTabIndex === 2) {
        return bookmarks?.includes(lockdropEvent.addr);
      }
      return true;
    },
  );

  const [sortBy, setSortBy] = useState<keyof LockdropEvent | "balance">(
    "end_at",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedLockdropEvents = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    return filteredLockdropEvents.sort((a, b) => {
      if (sortBy === "balance") {
        return Numeric.parse(balances[a.index] || 0).gt(balances[b.index] || 0)
          ? dir
          : -dir;
      }

      if (a[sortBy] === b[sortBy]) {
        return 0;
      }

      try {
        return Numeric.parse(a[sortBy]).gt(b[sortBy]) ? dir : -dir;
      } catch (error) {
        console.log(error);
      }
      return a[sortBy] > b[sortBy] ? dir : -dir;
    });
  }, [balances, filteredLockdropEvents, sortBy, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTabIndex]);

  useEffect(() => {
    lockdropUserInfoResults.forEach((result) => {
      result.refetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const onSortClick = (newSortBy: typeof sortBy) => {
    setSortDirection((current) =>
      newSortBy !== sortBy || current === "asc" ? "desc" : "asc",
    );
    setSortBy(newSortBy);
  };

  return (
    <>
      <ScrollToTop />

      <Container>
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <AssetSelector
            addresses={addresses}
            onChange={(newAddresses) => setAddresses(newAddresses)}
          />
        </div>

        <Panel shadow>
          <Row
            justify="between"
            align="center"
            css={css`
              gap: 20px;
              margin-bottom: 20px;
            `}
          >
            <Col xs={12} sm={6}>
              <div
                css={css`
                  max-width: 408px;
                  .${MOBILE_SCREEN_CLASS} &,
                  .${TABLET_SCREEN_CLASS} & {
                    max-width: unset;
                  }
                `}
              >
                <TabButton
                  size="large"
                  items={[
                    { value: "all", label: "All" },
                    { value: "my", label: "My" },
                    { value: "bookmark", label: "Bookmark" },
                  ]}
                  selectedIndex={selectedTabIndex}
                  onChange={(index) => setSelectedTabIndex(index)}
                />
              </div>
            </Col>
            <Col xs={12} sm="content">
              <Row align="center" justify="center" gutterWidth={8}>
                <Col xs="content">
                  <Typography color="primary" size={14} weight={900}>
                    Live only
                  </Typography>
                </Col>
                <Col width={80}>
                  <Switch
                    defaultChecked={isLiveOnly}
                    onClick={(event) => {
                      setIsLiveOnly(event.currentTarget.checked);
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <div
            css={css`
              margin-bottom: 25px;
              width: 100%;
              height: auto;
              position: relative;
              overflow-x: auto;
              overflow-y: hidden;

              & > div {
                min-width: 1111px;
                .${MOBILE_SCREEN_CLASS} &,
                .${TABLET_SCREEN_CLASS} & {
                  min-width: unset;
                }
              }
            `}
          >
            {!isSmallScreen && (
              <TableHeader>
                <div style={{ width: 32, marginRight: -10 }}>&nbsp;</div>
                <div>Pool</div>
                <div>
                  Total Staked LP
                  <IconButton
                    css={css`
                      vertical-align: middle;
                    `}
                    size={22}
                    icons={{
                      default:
                        sortBy === "total_locked_lp"
                          ? sortIcons[sortDirection]
                          : iconSortDefault,
                    }}
                    onClick={() => onSortClick("total_locked_lp")}
                  />
                </div>
                <div>
                  Allocation
                  <IconButton
                    css={css`
                      vertical-align: middle;
                    `}
                    size={22}
                    icons={{
                      default:
                        sortBy === "total_reward"
                          ? sortIcons[sortDirection]
                          : iconSortDefault,
                    }}
                    onClick={() => onSortClick("total_reward")}
                  />
                </div>
                <div style={{ width: 116 }}>
                  Event Ends In
                  <IconButton
                    css={css`
                      vertical-align: middle;
                    `}
                    size={22}
                    icons={{
                      default:
                        sortBy === "end_at"
                          ? sortIcons[sortDirection]
                          : iconSortDefault,
                    }}
                    onClick={() => onSortClick("end_at")}
                  />
                </div>
              </TableHeader>
            )}
            <LockdropEventList
              events={
                sortedLockdropEvents?.slice(
                  (currentPage - 1) * LIMIT,
                  currentPage * LIMIT,
                ) || []
              }
              userInfos={
                sortedLockdropEvents
                  .map((item) => lockdropUserInfos[item.index])
                  .slice((currentPage - 1) * LIMIT, currentPage * LIMIT) || []
              }
              emptyMessage={
                selectedTabIndex === 2
                  ? "No bookmark found."
                  : "No event found."
              }
            />
          </div>
          {!!sortedLockdropEvents?.length && (
            <Pagination
              current={currentPage}
              total={Math.floor((sortedLockdropEvents.length - 1) / LIMIT) + 1}
              onChange={(value) => {
                setCurrentPage(value);
              }}
            />
          )}
        </Panel>
      </Container>
      <Outlet />
    </>
  );
}

export default LockdropPage;
