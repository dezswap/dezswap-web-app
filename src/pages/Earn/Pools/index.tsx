import Panel from "components/Panel";
import Typography from "components/Typography";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { Link, Outlet } from "react-router-dom";

import { css, Global } from "@emotion/react";
import Pagination from "components/Pagination";
import TabButton from "components/TabButton";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { useEffect, useMemo, useState } from "react";
import usePairs from "hooks/usePairs";
import useAPI from "hooks/useAPI";
import { PairExtended } from "types/common";
import usePairBookmark from "hooks/usePairBookmark";
import { Numeric } from "@xpla/xpla.js";
import ScrollToTop from "components/ScrollToTop";
import usePools from "hooks/usePools";
import { useQueries } from "@tanstack/react-query";
import { convertIbcTokenAddressForPath } from "utils";
import iconSortDisabled from "assets/icons/icon-sort-disabled.svg";
import styled from "@emotion/styled";
import Box from "components/Box";
import PoolList from "./PoolList";
import Select from "./Select";
import AssetSelector from "../AssetSelector";
import AssetFormButton from "../AssetFormButton";

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

const TableHeader = styled(Box)`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 14px 20px;
  margin-bottom: 10px;
  gap: 20px;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    & > img {
      vertical-align: middle;
    }
  }
`;

function PoolPage() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const [selectedTimeBase, setSelectedTimeBase] = useState(timeBaseOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { findPair, getPair } = usePairs();
  const { bookmarks } = usePairBookmark();
  const { pools } = usePools();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const selectedPair = useMemo(
    () =>
      addresses?.[0] && addresses?.[1]
        ? findPair([addresses[0], addresses[1]])
        : undefined,
    [addresses, findPair],
  );
  const api = useAPI();

  const balances = useQueries({
    queries:
      pools?.map((pool) => ({
        queryKey: ["pool", pool.address],
        queryFn: async () => {
          const lpAddress = getPair(pool.address)?.liquidity_token;
          if (lpAddress) {
            const balance = await api.getTokenBalance(lpAddress);
            return balance;
          }
          return "0";
        },
        enabled: !!pool.address,
        refetchInterval: 30000,
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      })) || [],
  }).map((item) => item.data);

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
    return pools?.filter((item, index) => {
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
    });
  }, [pools, addresses, filteredPairs, selectedTabIndex, balances, bookmarks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTabIndex]);

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
              {!isSmallScreen && (
                <TableHeader>
                  <div style={{ width: 32, marginRight: -10 }}>&nbsp;</div>
                  <div style={{ width: 244 }}>Pool</div>
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
              <PoolList
                pools={
                  filteredPools?.slice(
                    (currentPage - 1) * LIMIT,
                    currentPage * LIMIT,
                  ) || []
                }
                emptyMessage={
                  [
                    undefined,
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
