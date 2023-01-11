import Hr from "components/Hr";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { Outlet } from "react-router-dom";

import { css } from "@emotion/react";
import Pagination from "components/Pagination";
import TabButton from "components/TabButton";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import usePairs from "hooks/usePair";
import { useAPI } from "hooks/useAPI";
import { Pool } from "types/pair";
import { PairExtended } from "types/common";
import usePairBookmark from "hooks/usePairBookmark";
import { Numeric } from "@xpla/xpla.js";
import IconButton from "components/IconButton";
import iconReload from "assets/icons/icon-reload.svg";
import iconReloadHover from "assets/icons/icon-reload-hover.svg";
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

export interface PoolExtended extends Pool {
  pair: PairExtended;
  hasBalance: boolean;
}

function PoolPage() {
  const screenClass = useScreenClass();
  const [selectedTimeBase, setSelectedTimeBase] = useState(timeBaseOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { pairs, findPair } = usePairs();
  const api = useAPI();
  const { bookmarks } = usePairBookmark();
  const [pools, setPools] = useState<PoolExtended[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const [selectedPair, setSelectedPair] = useState<PairExtended>();

  const poolList = useMemo(() => {
    return pools.filter((item) => {
      if (selectedPair) {
        return item.pair.contract_addr === selectedPair.contract_addr;
      }
      if (selectedTabIndex === 0) {
        return true;
      }
      if (selectedTabIndex === 1) {
        return item.hasBalance;
      }
      if (selectedTabIndex === 2) {
        return !!bookmarks?.includes(item.pair.contract_addr);
      }
      return false;
    });
  }, [bookmarks, pools, selectedTabIndex, selectedPair]);

  const handleReloadClick = useCallback(() => {
    setAddresses(undefined);
  }, []);

  useEffect(() => {
    const [address1, address2] = addresses || [];
    if (address1 && address2) {
      setSelectedPair(() => findPair([address1, address2]));
    }
  }, [addresses, findPair]);

  useEffect(() => {
    if (selectedPair) {
      setSelectedTabIndex(0);
    }
  }, [selectedPair]);

  useEffect(() => {
    let isAborted = false;
    const fetchPools = async () => {
      if (pairs) {
        const res = await Promise.all(
          pairs.map(async (item) => {
            if (isAborted) {
              return undefined;
            }
            const pool = await api.getPool(item.contract_addr);
            let hasBalance = false;
            try {
              const balance = await api.getTokenBalance(item.liquidity_token);
              hasBalance = Numeric.parse(balance || 0).gt(0);
            } catch (error) {
              console.log(error);
            }
            return { ...pool, pair: item, hasBalance };
          }),
        );
        if (!isAborted) {
          setPools(res.filter((pool) => pool) as PoolExtended[]);
        }
      }
    };
    fetchPools();
    return () => {
      isAborted = true;
    };
  }, [api, pairs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTabIndex]);

  return (
    <>
      <Container>
        <Row justify="between" align="center" gutterWidth={0}>
          <Col xs="content">
            <Typography
              size={32}
              color="primary"
              weight={900}
              css={css`
                margin-bottom: 19px;
              `}
            >
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
                  .${MOBILE_SCREEN_CLASS} & {
                    max-width: unset;
                  }
                  ${selectedPair &&
                  css`
                    pointer-events: none;
                  `}
                `}
              >
                <TabButton
                  size="large"
                  items={screenClass === "xs" ? mobileTabs : tabs}
                  selectedIndex={selectedTabIndex}
                  onChange={(index) => setSelectedTabIndex(index)}
                />
              </div>
            </Col>
            <Col xs={12} sm="content">
              <Row align="center" justify="center" gutterWidth={8}>
                <Col xs="content">
                  <Typography color="primary" size={14} weight={900}>
                    Time base
                  </Typography>
                </Col>
                <Col xs="content">
                  <Select
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
              pools={poolList.slice(
                (currentPage - 1) * LIMIT,
                currentPage * LIMIT,
              )}
              emptyMessage={
                [undefined, "No pool found.", "No bookmark found."][
                  selectedTabIndex
                ]
              }
            />
          </div>

          {!!poolList.length && (
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
