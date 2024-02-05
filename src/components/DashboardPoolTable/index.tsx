import { css } from "@emotion/react";
import HoverUnderline from "components/utils/HoverUnderline";
import Input from "components/Input";
import Pagination from "components/Pagination";
import Panel from "components/Panel";
import Table, { TableSortDirection } from "components/Table";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useAssets from "hooks/useAssets";
import { useEffect, useMemo, useState } from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import { DashboardPool } from "types/dashboard-api";
import { Numeric } from "@xpla/xpla.js";
import { getBasicSortFunction } from "utils/table";
import usePairs from "hooks/usePairs";
import AssetIcon from "components/AssetIcon";
import { Link } from "react-router-dom";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import PercentageFormatter from "components/utils/PercentageFormatter";
import MobilePoolItem from "./MobilePoolItem";

interface DashboardPoolTableProps {
  data: DashboardPool[];
  title?: string;
}

const emptyMessage = "The pool doesn't exist. Create a new pool.";

function DashboardPoolTable({
  data: dashboardPools,
  title = "All Pools",
}: DashboardPoolTableProps) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );

  const limit = useMemo(() => (isSmallScreen ? 5 : 10), [isSmallScreen]);

  const [searchKeyword, setSearchKeyword] = useState("");

  const { getAsset } = useAssets();
  const { getPair } = usePairs();
  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] =
    useState<keyof (typeof dashboardPools)[number]>("tvl");
  const [sortDirection, setSortDirection] =
    useState<TableSortDirection>("desc");

  const filteredData = useMemo(() => {
    return dashboardPools.filter((item) => {
      if (searchKeyword) {
        const pair = getPair(item.address);
        const [asset0, asset1] =
          pair?.asset_addresses.map((address) => getAsset(address)) || [];

        if (
          ![
            asset0?.token,
            asset0?.name,
            asset0?.symbol,
            asset1?.token,
            asset1?.name,
            asset1?.symbol,
            item.address,
          ].some((value) =>
            value?.toLowerCase().includes(searchKeyword.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [dashboardPools, getAsset, getPair, searchKeyword]);

  const sortedData = useMemo(() => {
    return filteredData.toSorted(getBasicSortFunction(sortBy, sortDirection));
  }, [filteredData, sortBy, sortDirection]);

  const totalPage = Math.ceil(sortedData.length / limit);
  const dataToDisplay = sortedData.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        gutterWidth={4}
        css={css`
          margin-bottom: 25px;
          .${MOBILE_SCREEN_CLASS} &,
          .${TABLET_SCREEN_CLASS} & {
            margin-bottom: 20px;
          }
          row-gap: 20px;
        `}
      >
        <Col xs={12} sm={6}>
          {title && (
            <Typography
              color="primary"
              size={screenClass === MOBILE_SCREEN_CLASS ? 14 : 20}
              weight={900}
            >
              {title}
            </Typography>
          )}
        </Col>
        <Col xs={12} sm={6}>
          <div
            css={css`
              width: 100%;
              max-width: 440px;
              margin-left: auto;
              .${MOBILE_SCREEN_CLASS} & {
                max-width: unset;
              }
            `}
          >
            <Input
              size="large"
              variant="primary"
              align="left"
              height={50}
              style={{ fontSize: 16, fontWeight: 700 }}
              css={css`
                &::placeholder {
                  text-align: center !important;
                }
                &:focus::placeholder {
                  opacity: 0;
                }
              `}
              borderStyle="solid"
              placeholder="Search name or paste address"
              onChange={(event) => {
                setSearchKeyword(event.target.value);
              }}
            />
          </div>
        </Col>
      </Row>
      {!isSmallScreen && (
        <Table
          idKey="address"
          data={dataToDisplay}
          sort={{ key: sortBy, direction: sortDirection }}
          onSortChange={(key, direction) => {
            setSortBy(key);
            setSortDirection(direction);
          }}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "none",
              label: "#",
              width: 10,
              hasSort: false,
              cellStyle: {
                overflow: "visible",
              },
              render(value, row, index) {
                return (page - 1) * limit + index + 1;
              },
            },
            {
              key: "address",
              label: "Pools",
              width: 300,
              render(address) {
                const pair = getPair(`${address}`);
                const assets = pair?.asset_addresses.map((assetAddress) =>
                  getAsset(assetAddress),
                );
                return (
                  <Row
                    justify="start"
                    align="center"
                    gutterWidth={10}
                    wrap="nowrap"
                  >
                    <Col
                      xs="content"
                      css={css`
                        font-size: 0;
                      `}
                    >
                      {assets?.map((asset, index) => (
                        <div
                          key={asset?.token}
                          css={css`
                            display: inline-block;
                          `}
                          style={{ marginLeft: -10 * index }}
                        >
                          <AssetIcon
                            key={asset?.token}
                            asset={{ icon: asset?.icon }}
                          />
                        </div>
                      ))}
                    </Col>
                    <Col
                      css={css`
                        min-width: 0;
                      `}
                    >
                      <Link
                        to={`/earn/pools/${address}`}
                        css={css`
                          max-width: 100%;
                          overflow: hidden;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                        `}
                      >
                        <HoverUnderline>
                          {assets?.map((asset) => asset?.symbol).join("-")}
                        </HoverUnderline>
                      </Link>
                    </Col>
                  </Row>
                );
              },
            },
            {
              key: "tvl",
              label: "TVL",
              width: 220,
              hasSort: true,
              render(value) {
                return value && <CurrencyFormatter value={value} />;
              },
            },
            {
              key: "volume",
              label: "Volume 24H",
              width: 220,
              hasSort: true,
              render(value) {
                return value && <CurrencyFormatter value={value} />;
              },
            },
            {
              key: "fee",
              label: "Fee 24H",
              width: 220,
              hasSort: true,
              render(value) {
                return value && <CurrencyFormatter value={value} />;
              },
            },
            {
              key: "apr",
              label: "APR 7D",
              width: 77,
              hasSort: true,
              render(value) {
                return (
                  value &&
                  !Number.isNaN(Number(value)) && (
                    <PercentageFormatter
                      value={Numeric.parse(value).mul(100)}
                    />
                  )
                );
              },
            },
          ]}
        />
      )}

      {isSmallScreen && (
        <Table
          idKey="address"
          columns={[]}
          data={dataToDisplay}
          hideHeader
          emptyMessage={emptyMessage}
          renderRow={(transaction, index) => (
            <MobilePoolItem
              number={(page - 1) * limit + index + 1}
              pool={transaction}
            />
          )}
        />
      )}

      {totalPage >= 2 && (
        <div
          css={css`
            margin-top: 25px;
          `}
        >
          <Pagination
            current={page}
            total={totalPage}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </Panel>
  );
}

export default DashboardPoolTable;
