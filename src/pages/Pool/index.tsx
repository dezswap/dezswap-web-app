import Hr from "components/Hr";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { Outlet } from "react-router-dom";

import { css, Global } from "@emotion/react";
import Pagination from "components/Pagination";
import TabButton from "components/TabButton";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import usePairs from "hooks/usePairs";
import useAPI from "hooks/useAPI";
import { PairExtended } from "types/common";
import usePairBookmark from "hooks/usePairBookmark";
import { Numeric } from "@xpla/xpla.js";
import IconButton from "components/IconButton";
import iconReload from "assets/icons/icon-reload.svg";
import iconReloadHover from "assets/icons/icon-reload-hover.svg";
import ScrollToTop from "components/ScrollToTop";
import usePools from "hooks/usePools";
import { useQueries } from "@tanstack/react-query";
import PoolList from "./PoolList";
import Select from "./Select";
import PoolForm from "./PoolForm";

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
const LIMIT = 8;

function PoolPage() {
  const screenClass = useScreenClass();
  const [selectedTimeBase, setSelectedTimeBase] = useState(timeBaseOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { findPair, getPair } = usePairs();
  const { bookmarks } = usePairBookmark();
  const { pools } = usePools();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const [selectedPair, setSelectedPair] = useState<PairExtended>();
  const api = useAPI();

  const balanceQueryResults = useQueries({
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
  });

  const balances = useMemo(() => {
    return balanceQueryResults.map((item) => item.data);
  }, [balanceQueryResults]);

  const poolList = useMemo(() => {
    return pools?.filter((item, index) => {
      const isSelectedPair =
        !selectedPair || item.address === selectedPair.contract_addr;
      switch (selectedTabIndex) {
        case 0:
          return isSelectedPair;
        case 1:
          return isSelectedPair && Numeric.parse(balances[index] || 0).gt(0);
        case 2:
          return isSelectedPair && !!bookmarks?.includes(item.address);
        default:
        // do nothing
      }
      return false;
    });
  }, [pools, selectedPair, selectedTabIndex, balances, bookmarks]);

  const handleReloadClick = useCallback(() => {
    setAddresses(undefined);
  }, []);

  useEffect(() => {
    const [address1, address2] = addresses || [];
    if (address1 && address2) {
      setSelectedPair(() => findPair([address1, address2]));
    } else {
      setSelectedPair(undefined);
    }
  }, [addresses, findPair]);

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
        <Row
          justify="between"
          align="center"
          gutterWidth={0}
          css={css`
            padding-top: 20px;
            margin-bottom: 19px;

            .${MOBILE_SCREEN_CLASS} & {
              padding-top: 10px;
              margin-bottom: 20px;
            }
          `}
        >
          <Col xs="content">
            <Typography size={32} color="primary" weight={900}>
              Pool
            </Typography>
          </Col>
          <Col xs="content">
            <IconButton
              size={38}
              icons={{ default: iconReload, hover: iconReloadHover }}
              onClick={handleReloadClick}
            />
          </Col>
        </Row>
        <Hr
          css={css`
            margin-bottom: 20px;
          `}
        />
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <PoolForm
            addresses={addresses}
            onChange={(value) => setAddresses(value)}
          />
        </div>

        <Panel shadow>
          <Row
            justify="between"
            align="center"
            css={css`
              gap: 20px;
              margin-bottom: 25px;
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
            `}
          >
            <PoolList
              pools={
                poolList?.slice(
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

          {!!poolList?.length && (
            <Pagination
              current={currentPage}
              total={Math.floor((poolList.length - 1) / LIMIT) + 1}
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
