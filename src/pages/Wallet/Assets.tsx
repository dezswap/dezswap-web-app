import { useMemo, useState } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import Button from "components/Button";
import Panel from "components/Panel";
import Table, { TableSortDirection } from "components/Table";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import useBalances from "hooks/useBalances";
import usePairs from "hooks/usePairs";
import {
  formatNumber,
  formatDecimals,
  amountToValue,
  formatCurrency,
} from "utils";
import { Token } from "types/api";
import TabButton from "components/TabButton";
import { Link } from "react-router-dom";
import useBookmark from "hooks/useBookmark";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import IconButton from "components/IconButton";
import AssetIcon from "components/AssetIcon";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useDashboard from "hooks/dashboard/useDashboard";
import { getBasicSortFunction } from "utils/table";
import MobileAssetItem from "./MobileAssetItem";

export type TokenWithBalanceAndValue = Partial<Token> & {
  balance?: string;
  value?: string;
};

const tabs = [
  {
    label: "My Tokens",
    value: "my-tokens",
  },
  {
    label: "Bookmarks",
    value: "bookmarks",
  },
];

function Assets() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { availableAssetAddresses } = usePairs();
  const { getAsset } = useAssets();
  const { tokens: dashboardTokens } = useDashboard();

  const balances = useBalances(availableAssetAddresses);
  const { bookmarks, toggleBookmark } = useBookmark();

  const [sortBy, setSortBy] = useState<keyof TokenWithBalanceAndValue>("value");
  const [sortDirection, setSortDirection] =
    useState<TableSortDirection>("desc");

  const assets = useMemo<TokenWithBalanceAndValue[]>(() => {
    return balances
      .filter(
        (item): item is Exclude<typeof item, undefined | null> =>
          !!item?.address,
      )
      .map((balance) => {
        const asset = getAsset(balance.address);
        const dashboardToken = dashboardTokens?.find(
          (item) => item?.address === balance.address,
        );
        return {
          ...asset,
          balance: balance?.balance,
          value: Numeric.parse(dashboardToken?.price || 0)
            .mul(amountToValue(balance.balance, asset?.decimals || 0) || "0")
            .toString(),
        };
      });
  }, [balances, dashboardTokens, getAsset]);

  const userAssets = useMemo(() => {
    return assets.filter(
      (asset) => asset.balance && Numeric.parse(asset.balance).gt(0),
    );
  }, [assets]);

  const bookmarkedAssets = useMemo(() => {
    return assets.filter(
      (asset) => asset.token && bookmarks?.includes(asset.token),
    );
  }, [assets, bookmarks]);

  const [selectedTabIndex, setSelectedIndex] = useState(0);

  const assetsToDisplay = useMemo(() => {
    return (selectedTabIndex === 0 ? userAssets : bookmarkedAssets).toSorted(
      getBasicSortFunction(sortBy, sortDirection),
    );
  }, [selectedTabIndex, userAssets, bookmarkedAssets, sortBy, sortDirection]);

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
      {isSmallScreen ? (
        <Table
          hideHeader
          columns={[]}
          renderRow={(row) => {
            const isBookmarked = !!bookmarks?.find(
              (address) => address === row.token,
            );
            return (
              <MobileAssetItem
                asset={row}
                isBookmarked={isBookmarked}
                onBookmarkClick={(asset) =>
                  asset?.token && toggleBookmark(asset?.token)
                }
              />
            );
          }}
          data={assetsToDisplay}
          idKey="token"
          emptyMessage="No tokens found"
        />
      ) : (
        <Table
          minWidth={1110}
          columns={[
            {
              key: "name",
              label: "Token",
              width: 284,
              hasSort: true,
              render: (name, row) => {
                return (
                  <Row justify="start" align="center" gutterWidth={10}>
                    <Col xs="content">
                      <IconButton
                        size={32}
                        style={{ alignItems: "center" }}
                        icons={{
                          default:
                            row.token && bookmarks?.includes(row.token)
                              ? iconBookmarkSelected
                              : iconBookmark,
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (row.token) {
                            toggleBookmark(row.token);
                          }
                        }}
                      />
                    </Col>
                    <Col xs="content">
                      <AssetIcon asset={row} />
                    </Col>
                    <Col width={200}>
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
                          {name}&nbsp;
                        </div>
                        {row.symbol && (
                          <Typography
                            size={16}
                            weight={500}
                            css={css`
                              opacity: 0.7;
                              display: inline-block;
                            `}
                          >
                            ({row.symbol})
                          </Typography>
                        )}
                      </div>
                    </Col>
                  </Row>
                );
              },
            },
            {
              key: "value",
              label: "Value",
              width: 260,
              hasSort: true,
              render: (value) => {
                return formatCurrency(value ? `${value}` : 0);
              },
            },
            {
              key: "balance",
              label: "Token Amount",
              width: 260,
              hasSort: true,
              render: (_, row) =>
                `${formatNumber(
                  formatDecimals(
                    amountToValue(row.balance, row.decimals) || "0",
                    2,
                  ),
                )} ${row.symbol}`,
            },
            {
              key: "none",
              label: "",
              flex: 1,
              render: (_, row) => (
                <div
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                  `}
                >
                  {typeof row.token === "string" && (
                    <Link
                      to={{
                        pathname: "/trade/swap",
                        search: new URLSearchParams({
                          q: row.token,
                        }).toString(),
                      }}
                    >
                      <Button variant="primary" size="default">
                        Swap
                      </Button>
                    </Link>
                  )}
                </div>
              ),
            },
          ]}
          data={assetsToDisplay}
          sort={{
            key: sortBy,
            direction: sortDirection,
          }}
          onSortChange={(key, direction) => {
            setSortBy(key);
            setSortDirection(direction);
          }}
          idKey="token"
          emptyMessage="No tokens found"
        />
      )}
    </Panel>
  );
}

export default Assets;
