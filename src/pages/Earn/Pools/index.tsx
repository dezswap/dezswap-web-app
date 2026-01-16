import { Global, css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { Outlet } from "react-router-dom";

import Link from "~/components/Link";
import Pagination from "~/components/Pagination";
import Panel from "~/components/Panel";
import ScrollToTop from "~/components/ScrollToTop";
import TabButton from "~/components/TabButton";
import Table, { TableSortDirection } from "~/components/Table";
import Typography from "~/components/Typography";

import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "~/constants/layout";

import useDashboard from "~/hooks/dashboard/useDashboard";
import useBalances from "~/hooks/useBalances";
import usePairBookmark from "~/hooks/usePairBookmark";
import usePairs from "~/hooks/usePairs";
import usePools from "~/hooks/usePools";
import useSearchParamState from "~/hooks/useSearchParamState";

import { DashboardPool } from "~/types/dashboard-api";

import { convertIbcTokenAddressForPath } from "~/utils";
import { getBasicSortFunction } from "~/utils/table";

import AssetFormButton from "../AssetFormButton";
import AssetSelector from "../AssetSelector";
import PoolItem from "./PoolItem";
import Select from "./Select";

const timeBaseOptions = ["24h", "7d", "1m"];
const tabs = [
  { value: "lp", label: "Liquidity pool" },
  { value: "my-pool", label: "My pool" },
  { value: "bookmark", label: "Bookmark" },
];
const mobileTabs = [
  { value: "lp", label: "LP" },
  { value: "my-pool", label: "My LP" },
  { value: "bookmark", label: "Bookmark" },
];
const LIMIT = 10;

function PoolPage() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const [selectedTimeBase, setSelectedTimeBase] = useState(timeBaseOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { findPair, getPair } = usePairs();
  const { bookmarks, toggleBookmark } = usePairBookmark();
  const { pools: dashboardPools } = useDashboard();
  const { pools } = usePools();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const notListedPools = useMemo(() => {
    return (
      pools
        ?.filter((pool) => {
          return !dashboardPools?.find(
            (dashboardPool) => dashboardPool.address === pool.address,
          );
        })
        .map((pool) => {
          const res: DashboardPool = {
            address: pool.address,
            volume: "0",
            fee: "0",
            apr: "0",
            tvl: "0",
          };
          return res;
        }) || []
    );
  }, [dashboardPools, pools]);

  const allPools = useMemo(() => {
    return [...(dashboardPools || []), ...notListedPools];
  }, [dashboardPools, notListedPools]);

  const [sortBy, setSortBy] =
    useState<keyof Exclude<typeof dashboardPools, undefined>[number]>("tvl");
  const [sortDirection, setSortDirection] =
    useState<TableSortDirection>("desc");

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const selectedPair = useMemo(
    () =>
      addresses?.[0] && addresses?.[1]
        ? findPair([addresses[0], addresses[1]])
        : undefined,
    [addresses, findPair],
  );

  const balances = useBalances(
    allPools?.map((pool) => {
      return getPair(pool.address)?.liquidity_token || "";
    }) || [],
  ).map((item) => item?.balance);

  const { pairs } = usePairs();

  const filteredPairs = useMemo(
    () =>
      pairs?.filter((pair) => {
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

  const filteredPools = useMemo(() => {
    return (
      allPools?.filter((item, index) => {
        if (
          (addresses?.[0] || addresses?.[1]) &&
          !filteredPairs?.find((pair) => pair?.contract_addr === item.address)
        ) {
          return false;
        }
        switch (selectedTabIndex) {
          case 0:
            return true;
          case 1:
            return Numeric.parse(balances[index] || 0).gt(0);
          case 2:
            return !!bookmarks?.includes(item.address);
          default:
          // do nothing
        }
        return false;
      }) || []
    );
  }, [
    allPools,
    addresses,
    filteredPairs,
    selectedTabIndex,
    balances,
    bookmarks,
  ]);

  const sortedPools = useMemo(() => {
    return filteredPools.toSorted(getBasicSortFunction(sortBy, sortDirection));
  }, [filteredPools, sortBy, sortDirection]);

  const poolsToDisplay = useMemo(() => {
    return (
      sortedPools?.slice((currentPage - 1) * LIMIT, currentPage * LIMIT) || []
    );
  }, [currentPage, sortedPools]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTabIndex]);

  const [preselectedAddress, setPreselectedAddress] = useSearchParamState(
    "q",
    undefined,
    { replace: true },
  );

  useEffect(() => {
    if (preselectedAddress) {
      setAddresses([preselectedAddress, undefined]);
      setPreselectedAddress(undefined);
    }
  }, [preselectedAddress, setPreselectedAddress]);

  return (
    <>
      <Global
        styles={css`
          body:has(#confirm-modal) {
            & #provide-modal,
            & #withdraw-modal {
              opacity: 0;
              pointer-events: none;
            }
          }
        `}
      />
      <ScrollToTop />
      <Container>
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <AssetSelector
            addresses={addresses}
            onChange={(value) => setAddresses(value)}
            extra={
              <>
                {!addresses?.[0] || !addresses?.[1] ? (
                  <AssetFormButton variant="primary" disabled>
                    Select tokens first
                  </AssetFormButton>
                ) : undefined}
                {addresses?.[0] && addresses?.[1] && selectedPair ? (
                  <Link
                    to={`add-liquidity/${selectedPair.contract_addr}`}
                    relative="route"
                    css={css`
                      text-decoration: none;
                    `}
                  >
                    <AssetFormButton as="div" variant="primary">
                      Add liquidity
                    </AssetFormButton>
                  </Link>
                ) : undefined}
                {addresses?.[0] && addresses?.[1] && !selectedPair ? (
                  <Link
                    to={`create/${addresses
                      ?.map((a) => convertIbcTokenAddressForPath(a))
                      .join("/")}`}
                    relative="route"
                    css={css`
                      text-decoration: none;
                    `}
                  >
                    <AssetFormButton variant="gradient">
                      Create a new pool
                    </AssetFormButton>
                  </Link>
                ) : undefined}
              </>
            }
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
                  items={
                    [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
                      screenClass,
                    )
                      ? mobileTabs
                      : tabs
                  }
                  selectedIndex={selectedTabIndex}
                  onChange={(index) => setSelectedTabIndex(index)}
                />
              </div>
            </Col>
            <Col xs={12} sm="content">
              <Row
                align="center"
                justify="center"
                gutterWidth={8}
                css={css`
                  pointer-events: none;
                `}
              >
                <Col xs="content">
                  <Typography color="disabled" size={14} weight={900}>
                    Time base
                  </Typography>
                </Col>
                <Col width={80}>
                  <Select
                    block
                    disabled
                    options={timeBaseOptions.map((value) => ({
                      value,
                      label: value.toUpperCase(),
                    }))}
                    onChange={(value) => setSelectedTimeBase(`${value}`)}
                    value={selectedTimeBase}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <div
            css={css`
              margin-bottom: 25px;
              overflow-x: auto;
            `}
          >
            <div
              css={css`
                width: 100%;
                position: relative;
                height: auto;

                & > div {
                  min-width: 1111px;
                  .${MOBILE_SCREEN_CLASS} &,
                  .${TABLET_SCREEN_CLASS} & {
                    min-width: unset;
                  }
                }
              `}
            >
              <Table
                idKey="address"
                hideHeader={isSmallScreen}
                columns={[
                  {
                    key: "none",
                    width: 22,
                    label: "",
                    hasSort: false,
                  },
                  {
                    key: "address",
                    width: 244,
                    label: "Pool",
                    hasSort: false,
                  },
                  {
                    key: "tvl",
                    width: 200,
                    label: "Total Liquidity",
                    hasSort: true,
                  },
                  {
                    key: "volume",
                    width: 200,
                    label: "Volume(24H)",
                    hasSort: true,
                  },
                  {
                    key: "fee",
                    width: 200,
                    label: "Fees(24H)",
                    hasSort: true,
                  },
                  {
                    key: "apr",
                    width: 80,
                    label: "APR",
                    hasSort: true,
                  },
                ]}
                sort={{ key: sortBy, direction: sortDirection }}
                onSortChange={(key, direction) => {
                  setSortBy(key);
                  setSortDirection(direction);
                }}
                data={poolsToDisplay}
                renderRow={(dashboardPool) => (
                  <PoolItem
                    poolAddress={dashboardPool.address}
                    bookmarked={bookmarks?.includes(dashboardPool.address)}
                    onBookmarkClick={() =>
                      toggleBookmark(dashboardPool.address)
                    }
                  />
                )}
                emptyMessage={
                  [
                    "The pool doesn't exist. Create a new pool.",
                    selectedPair ? "No my pool found." : "No pool found.",
                    "No bookmark found.",
                  ][selectedTabIndex]
                }
              />
            </div>
          </div>

          {!!filteredPools?.length && (
            <Pagination
              current={currentPage}
              total={Math.floor((filteredPools.length - 1) / LIMIT) + 1}
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

export default PoolPage;
