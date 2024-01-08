import { css } from "@emotion/react";
import HoverUnderline from "components/HoverUnderline";
import Input from "components/Input";
import Pagination from "components/Pagination";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Table, { TableSortDirection } from "components/Table";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useAssets from "hooks/useAssets";
import useNetwork from "hooks/useNetwork";
import Select from "pages/Earn/Pools/Select";
import { useMemo, useState } from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import { DashboardTransaction } from "types/dashboard-api";
import {
  amountToValue,
  ellipsisCenter,
  formatCurrency,
  formatNumber,
  getAddressLink,
  getFromNow,
  getTransactionLink,
} from "utils";
import { getBasicSortFunction } from "utils/table";
import MobileTransactionItem from "./MobileTransactionItem";

interface DashboardTransactionTableProps {
  data: DashboardTransaction[];
}

const LIMIT = 10;

const filterTabs = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Swaps",
    value: "swap",
  },
  {
    label: "Adds",
    value: "add",
  },
  {
    label: "Removes",
    value: "remove",
  },
];

function DashboardTransactionTable({ data }: DashboardTransactionTableProps) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const network = useNetwork();

  const [selectedFilterTabIndex, setSelectedFilterTabIndex] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { getAsset } = useAssets();
  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] =
    useState<keyof (typeof data)[number]>("timestamp");
  const [sortDirection, setSortDirection] =
    useState<TableSortDirection>("desc");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (searchKeyword) {
        const asset0 = getAsset(item.asset0);
        const asset1 = getAsset(item.asset1);

        if (
          ![
            asset0?.token,
            asset0?.name,
            asset0?.symbol,
            asset1?.token,
            asset1?.name,
            asset1?.symbol,
            item.account,
          ].some((value) =>
            value?.toLowerCase().includes(searchKeyword.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      if (
        selectedFilterTabIndex > 0 &&
        item.action !== filterTabs[selectedFilterTabIndex].value
      ) {
        return false;
      }
      return true;
    });
  }, [data, selectedFilterTabIndex, searchKeyword, getAsset]);

  const sortedData = useMemo(() => {
    return filteredData.toSorted(getBasicSortFunction(sortBy, sortDirection));
  }, [filteredData, sortBy, sortDirection]);

  const totalPage = Math.ceil(sortedData.length / LIMIT);
  const dataToDisplay = sortedData.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        gutterWidth={4}
        css={css`
          margin-bottom: 25px;
          .${MOBILE_SCREEN_CLASS} & {
            margin-bottom: 20px;
          }
          row-gap: 20px;
        `}
      >
        <Col xs={12} md={6}>
          {!isSmallScreen && (
            <div
              css={css`
                max-width: 452px;
              `}
            >
              <TabButton
                size="large"
                items={filterTabs}
                selectedIndex={selectedFilterTabIndex}
                onChange={(index) => setSelectedFilterTabIndex(index)}
              />
            </div>
          )}
          {isSmallScreen && (
            <Row justify="between" align="center" gutterWidth={4}>
              <Col xs="content">
                <Typography size={14} weight={900} color="primary">
                  Transactions
                </Typography>
              </Col>
              <Col xs="content">
                <Select
                  value={filterTabs[selectedFilterTabIndex].value}
                  options={filterTabs}
                  onChange={(value) =>
                    setSelectedFilterTabIndex(
                      filterTabs.findIndex((item) => item.value === value),
                    )
                  }
                />
              </Col>
            </Row>
          )}
        </Col>
        <Col xs={12} md={6}>
          <div
            css={css`
              width: 100%;
              max-width: 440px;
              margin-left: auto;
              .${MOBILE_SCREEN_CLASS} &,
              .${TABLET_SCREEN_CLASS} & {
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
          idKey={["hash", "action"]}
          data={dataToDisplay}
          sort={{ key: sortBy, direction: sortDirection }}
          onSortChange={(key, direction) => {
            setSortBy(key);
            setSortDirection(direction);
          }}
          columns={[
            {
              key: "actionDisplay",
              label: "Transaction",
              width: 230,
              render(actionDisplay, row) {
                return (
                  <HoverUnderline>
                    <a
                      href={getTransactionLink(row.hash, network.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      css={css`
                        white-space: nowrap;
                      `}
                    >
                      {actionDisplay}
                    </a>
                  </HoverUnderline>
                );
              },
            },
            {
              key: "totalValue",
              label: "Total Value",
              width: 160,
              hasSort: true,
              render(value) {
                return (
                  <div
                    css={css`
                      padding: 8.5px 0;
                    `}
                  >
                    {formatCurrency(`${value}`)}
                  </div>
                );
              },
            },
            {
              key: "asset0amount",
              label: "Token Amount",
              width: 160,
              hasSort: true,
              render(amount, row) {
                const asset = getAsset(row.asset0);
                return `${formatNumber(
                  amountToValue(`${amount}`, asset?.decimals) || "",
                )} ${asset?.symbol}`;
              },
            },
            {
              key: "asset1amount",
              label: "Token Amount",
              width: 160,
              hasSort: true,
              render(amount, row) {
                const asset = getAsset(row.asset1);
                return `${formatNumber(
                  amountToValue(`${amount}`, asset?.decimals) || "",
                )} ${asset?.symbol}`;
              },
            },
            {
              key: "account",
              label: "Account",
              width: 160,
              hasSort: true,
              render(address) {
                return (
                  address && (
                    <HoverUnderline>
                      <a
                        href={getAddressLink(address, network.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={css`
                          white-space: nowrap;
                        `}
                      >
                        {ellipsisCenter(address)}
                      </a>
                    </HoverUnderline>
                  )
                );
              },
            },
            {
              key: "timestamp",
              label: "Time",
              width: 113,
              hasSort: true,
              render(timestamp) {
                return (
                  <div
                    css={css`
                      white-space: nowrap;
                    `}
                  >
                    {getFromNow(`${timestamp}`)}
                  </div>
                );
              },
            },
          ]}
        />
      )}

      {isSmallScreen && (
        <Table
          idKey={["hash", "action"]}
          columns={[]}
          data={dataToDisplay}
          hideHeader
          renderRow={(transaction) => (
            <MobileTransactionItem transaction={transaction} />
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

export default DashboardTransactionTable;