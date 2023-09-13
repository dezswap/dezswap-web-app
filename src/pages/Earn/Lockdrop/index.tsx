import { css } from "@emotion/react";
import ScrollToTop from "components/ScrollToTop";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { useEffect, useMemo, useState } from "react";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
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
import Typography from "components/Typography";
import useSearchParamState from "hooks/useSearchParamState";
import useNetwork from "hooks/useNetwork";
import AssetSelector from "../AssetSelector";
import LockdropEventList from "./LockdropEventList";
import Select from "../Pools/Select";

type EventStatus = "Live" | "Upcoming" | "Closed";
type Tab = "all" | "my" | "bookmark";

const tabs: readonly Tab[] = ["all", "my", "bookmark"] as const;

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
  const network = useNetwork();
  const location = useLocation();

  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const {
    lockdropEvents: originalLockdropEvents,
    refetch: refetchLockdropEvents,
  } = useLockdropEvents();
  const api = useAPI();
  const { findPair, findPairByLpAddress } = usePairs();

  const lockdropEvents = useMemo(() => {
    return originalLockdropEvents.map((lockdropEvent, index) => ({
      ...lockdropEvent,
      index,
    }));
  }, [originalLockdropEvents]);

  const lockdropUserInfoResults = useQueries({
    queries: lockdropEvents.map((lockdropEvent) => ({
      queryKey: ["lockdropUserInfo", lockdropEvent.addr, network.chainID],
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

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const [selectedTab, setSelectedTab] = useSearchParamState<Tab>("tab", "all");
  const selectedTabIndex = tabs.indexOf(selectedTab || "all");
  const [eventStatusFilter, setEventStatusFilter] =
    useSearchParamState<EventStatus>("status", "Live");
  const [currentPage, setCurrentPage] = useState(1);
  const { bookmarks } = useLockdropBookmark();

  const pairs = useMemo(() => {
    return lockdropEvents.map((lockdropEvent) => {
      return findPairByLpAddress(lockdropEvent.lp_token_addr);
    });
  }, [findPairByLpAddress, lockdropEvents]);

  const filteredPairs = useMemo(
    () =>
      pairs.filter((pair) => {
        if (addresses?.[0] && addresses?.[1]) {
          return (
            pair?.asset_addresses.includes(addresses?.[0] || "") &&
            pair?.asset_addresses.includes(addresses?.[1] || "")
          );
        }
        return (
          pair?.asset_addresses.includes(addresses?.[0] || "") ||
          pair?.asset_addresses.includes(addresses?.[1] || "")
        );
      }),
    [addresses, pairs],
  );

  const filteredLockdropEvents = lockdropEvents.filter(
    (lockdropEvent, index) => {
      if (lockdropEvent.canceled) {
        return false;
      }
      if (
        (addresses?.[0] || addresses?.[1]) &&
        !filteredPairs.find(
          (pair) => pair?.liquidity_token === lockdropEvent.lp_token_addr,
        )
      ) {
        return false;
      }
      if (selectedTab === "all") {
        if (
          eventStatusFilter === "Live" &&
          (lockdropEvent.end_at * 1000 < Date.now() ||
            lockdropEvent.start_at * 1000 > Date.now())
        ) {
          return false;
        }
        if (
          eventStatusFilter === "Upcoming" &&
          lockdropEvent.start_at * 1000 <= Date.now()
        ) {
          return false;
        }
        if (
          eventStatusFilter === "Closed" &&
          lockdropEvent.end_at * 1000 >= Date.now()
        ) {
          return false;
        }
      }
      if (selectedTab === "my") {
        return !!lockdropUserInfos[index]?.lockup_infos.length;
      }
      if (selectedTab === "bookmark") {
        return bookmarks?.includes(lockdropEvent.addr);
      }
      return true;
    },
  );

  const [sortBy, setSortBy] = useState<
    keyof Omit<LockdropEvent, "canceled"> | "bookmarkedAt"
  >("end_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (selectedTab === "all") {
      setSortBy("start_at");
      setSortDirection("asc");
      setEventStatusFilter((current) => current || "Live");
    }
    if (selectedTab === "my") {
      setSortBy("end_at");
      setSortDirection("asc");
      setEventStatusFilter(undefined);
    }
    if (selectedTab === "bookmark") {
      setSortBy("bookmarkedAt");
      setSortDirection("asc");
      setEventStatusFilter(undefined);
    }
  }, [selectedTab, setEventStatusFilter]);

  const sortedLockdropEvents = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    return filteredLockdropEvents.sort((a, b) => {
      if (sortBy === "bookmarkedAt") {
        return (bookmarks?.indexOf(a.addr) || 0) <
          (bookmarks?.indexOf(b.addr) || 0)
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
  }, [bookmarks, filteredLockdropEvents, sortBy, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, eventStatusFilter]);

  useEffect(() => {
    refetchLockdropEvents();
    lockdropUserInfoResults.forEach((result) => {
      result.refetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
                  onChange={(index) => setSelectedTab(tabs[index])}
                />
              </div>
            </Col>
            {selectedTab === "all" && (
              <Col xs={12} sm="content">
                <Row align="center" justify="center" gutterWidth={8}>
                  <Col xs="content">
                    <Typography color="primary" size={14} weight={900}>
                      Event status
                    </Typography>
                  </Col>
                  <Col width={125}>
                    <Select
                      block
                      options={(
                        ["Live", "Upcoming", "Closed"] as EventStatus[]
                      ).map((value) => ({
                        value,
                        label: value,
                      }))}
                      onChange={(value) =>
                        setEventStatusFilter(value as EventStatus)
                      }
                      value={eventStatusFilter}
                    />
                  </Col>
                </Row>
              </Col>
            )}
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
                {eventStatusFilter === "Upcoming" ? (
                  <div>
                    Event Starts In
                    <IconButton
                      css={css`
                        vertical-align: middle;
                      `}
                      size={22}
                      icons={{
                        default:
                          sortBy === "start_at"
                            ? sortIcons[sortDirection]
                            : iconSortDefault,
                      }}
                      onClick={() => onSortClick("start_at")}
                    />
                  </div>
                ) : (
                  <div>
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
                )}
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
                selectedTab === "bookmark"
                  ? "No bookmark found."
                  : "No event found."
              }
              isUpcoming={eventStatusFilter === "Upcoming"}
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
