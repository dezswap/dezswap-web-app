import { css } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import Input from "components/Input";
import Pagination from "components/Pagination";
import Panel from "components/Panel";
import Table, { TableSortDirection } from "components/Table";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { useEffect, useMemo, useState } from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import useDashboard from "hooks/dashboard/useDashboard";
import useAssets from "hooks/useAssets";
import HoverUnderline from "components/utils/HoverUnderline";
import ChangeRateFormatter from "components/utils/ChangeRateFormatter";
import { DashboardToken } from "types/dashboard-api";
import { getBasicSortFunction } from "utils/table";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import Link from "components/Link";
import MobileTokenItem from "./MobileTokenItem";

function AllTokens({ whiteList }: { whiteList?: string[] }) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const limit = useMemo(() => (isSmallScreen ? 5 : 10), [isSmallScreen]);

  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [sortBy, setSortBy] = useState<keyof DashboardToken>("tvl");
  const [sortDirection, setSortDirection] =
    useState<TableSortDirection>("desc");

  const { tokens } = useDashboard();

  const { getAsset } = useAssets();

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];
    const tokenList = whiteList
      ? tokens?.filter((token) => whiteList.includes(token.address))
      : tokens;

    return tokenList.filter((token) => {
      if (!searchKeyword) return true;
      const asset = getAsset(token.address);
      return [asset?.token, asset?.name, asset?.symbol].some((value) =>
        value?.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    });
  }, [getAsset, searchKeyword, tokens, whiteList]);

  const sortedTokens = useMemo(() => {
    if (!filteredTokens?.length) return [];

    return filteredTokens.toSorted(getBasicSortFunction(sortBy, sortDirection));
  }, [filteredTokens, sortBy, sortDirection]);

  const tokensToDisplay = useMemo(() => {
    return sortedTokens.slice((page - 1) * limit, page * limit);
  }, [sortedTokens, page, limit]);

  const totalPage = Math.ceil(sortedTokens.length / limit);

  useEffect(() => {
    setPage(1);
  }, [filteredTokens, limit]);

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        css={css`
          margin-bottom: 25px;
          row-gap: 20px;

          .${MOBILE_SCREEN_CLASS} & {
            margin-bottom: 20px;
          }
        `}
      >
        <Col xs={12} sm="content">
          <Typography
            size={screenClass === MOBILE_SCREEN_CLASS ? 14 : 20}
            weight={900}
            color="primary"
          >
            All Tokens
          </Typography>
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
              style={{ fontSize: "16px", fontWeight: "bold" }}
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
      <div
        css={css`
          margin-bottom: 25px;
        `}
      >
        {isSmallScreen ? (
          <Table
            idKey="address"
            columns={[]}
            hideHeader
            renderRow={(token, index) => (
              <MobileTokenItem
                number={(page - 1) * limit + index + 1}
                token={token}
              />
            )}
            data={tokensToDisplay}
          />
        ) : (
          <Table
            idKey="address"
            sort={{ key: sortBy, direction: sortDirection }}
            onSortChange={(key, direction) => {
              setSortBy(key);
              setSortDirection(direction);
            }}
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
                label: "Token",
                width: 300,
                hasSort: false,
                render(address) {
                  const asset = getAsset(`${address}`);
                  return (
                    <Row
                      justify="start"
                      align="center"
                      gutterWidth={10}
                      css={css`
                        margin: 0 !important;
                      `}
                    >
                      <Col xs="content">
                        <AssetIcon asset={{ icon: asset?.icon }} />
                      </Col>
                      <Col
                        width={246}
                        css={css`
                          & > div {
                            max-width: 100%;
                            width: auto;
                            display: inline-block;
                          }
                        `}
                      >
                        <HoverUnderline>
                          <Link
                            to={`/tokens/${encodeURIComponent(`${address}`)}`}
                          >
                            <div
                              css={css`
                                display: flex;
                                justify-content: flex-start;
                                align-items: center;
                              `}
                            >
                              <div
                                css={css`
                                  white-space: nowrap;
                                  word-break: break-all;
                                  text-overflow: ellipsis;
                                  overflow: hidden;
                                `}
                              >
                                {asset?.name}&nbsp;
                              </div>
                              {asset?.symbol && (
                                <Typography
                                  size={16}
                                  weight={500}
                                  css={css`
                                    opacity: 0.7;
                                    display: inline-block;
                                  `}
                                >
                                  ({asset?.symbol})
                                </Typography>
                              )}
                            </div>
                          </Link>
                        </HoverUnderline>
                      </Col>
                    </Row>
                  );
                },
              },
              {
                key: "price",
                label: "Price",
                width: 190,
                hasSort: true,
                render(price) {
                  return price && <CurrencyFormatter value={price} />;
                },
              },
              {
                key: "priceChange",
                label: "Price Change",
                width: 190,
                hasSort: true,
                render(_priceChange) {
                  const priceChange = Number(_priceChange);
                  return (
                    <Typography size={16} weight={900}>
                      <ChangeRateFormatter
                        rate={priceChange}
                        hasBrackets={false}
                      />
                    </Typography>
                  );
                },
              },
              {
                key: "volume24h",
                label: "Volume 24H",
                width: 190,
                hasSort: true,
                render(value) {
                  return value && <CurrencyFormatter value={value} />;
                },
              },
              {
                key: "tvl",
                label: "TVL",
                width: 190,
                hasSort: true,
                render(value) {
                  return value && <CurrencyFormatter value={value} />;
                },
              },
            ]}
            data={tokensToDisplay}
          />
        )}
      </div>
      {totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(newPage) => setPage(newPage)}
        />
      )}
    </Panel>
  );
}

export default AllTokens;
