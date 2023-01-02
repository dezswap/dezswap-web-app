import { Col, Hidden, Row } from "react-grid-system";
import styled from "@emotion/styled";
import { css, useTheme } from "@emotion/react";
import React, { useDeferredValue, useMemo, useState } from "react";
import Typography from "components/Typography";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatNumber,
  isNativeTokenAddress,
} from "utils";
import iconBack from "assets/icons/icon-back.svg";
import { Asset as OrgAsset } from "types/common";
import iconToken from "assets/icons/icon-default-token.svg";
import iconVerified from "assets/icons/icon-verified.svg";
import IconButton from "components/IconButton";
import Input from "components/Input";
import Hr from "components/Hr";
import TabButton from "components/TabButton";
import useAssets from "hooks/useAssets";
import usePairs from "hooks/usePair";
import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import useBookmark from "hooks/useBookmark";
import Panel from "components/Panel";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Tooltip from "components/Tooltip";
import { useNetwork } from "hooks/useNetwork";

type Asset = Partial<OrgAsset & { disabled?: boolean }>;
export type LPAsset = {
  address: string;
  assets: [Asset, Asset];
  disabled?: boolean;
};
interface SelectAssetFormProps {
  title?: React.ReactNode;
  selectedAssetAddress?: string;
  hasBackButton?: boolean;
  onGoBack?(): void;
  goBackOnSelect?: boolean;
  onSelect?(address: string): void;

  addressList?: { address: string; isLP?: boolean }[];
}

const Wrapper = styled.div`
  width: 100%;
  height: calc(min(60vh, 690px) - 6px);
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  text-align: center;
  border-radius: 12px;
  min-height: 512px;

  .${MOBILE_SCREEN_CLASS} & {
    min-height: unset;
    max-height: unset;
    height: 80vh;
  }
`;

const AssetList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const AssetItem = styled.div<{ selected?: boolean; invisible?: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  height: auto;
  position: relative;
  padding: 16px 27px;
  .${MOBILE_SCREEN_CLASS} & {
    padding: 15px 13px;
  }

  background-color: transparent;
  cursor: pointer;
  border: none;
  margin: 0;
  text-align: left;
  overflow: hidden;
  transition: all 0.125s cubic-bezier(0, 1, 0, 1);
  max-height: 1280px;

  & .asset-address {
    display: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
    & .asset-name {
      display: none;
    }
    & .asset-address {
      display: unset;
    }
  }

  ${({ selected, theme }) =>
    selected &&
    css`
      background-color: ${theme.colors.text.background};
      & .asset-name {
        display: none;
      }
      & .asset-address {
        display: unset;
      }
    `}
  ${({ invisible }) =>
    invisible &&
    css`
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;
      pointer-events: none;
      .${MOBILE_SCREEN_CLASS} & {
        padding-top: 0;
        padding-bottom: 0;
      }
    `}
`;

const AssetIcon = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: inline-block;
  padding: 0px 6px;

  ${({ src = iconToken }) => css`
    background-image: url(${src || iconToken});
  `};
  background-size: 32px 32px;
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;

const tabs = [
  { label: "All", value: "all" },
  { label: "Bookmark", value: "bookmark" },
];

function SelectAssetForm(props: SelectAssetFormProps) {
  const {
    title = "Select a token",
    onSelect: handleSelect,
    selectedAssetAddress,
    hasBackButton,
    onGoBack,
    goBackOnSelect,
    addressList,
  } = props;
  const theme = useTheme();
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const { getAsset, verifiedAssets } = useAssets();
  const { findPairByLpAddress } = usePairs();
  const { bookmarks, toggleBookmark } = useBookmark();
  const network = useNetwork();
  const [tabIdx, setTabIdx] = useState(0);

  const assetList = useMemo(() => {
    const isBookmark = tabs[tabIdx].value === "bookmark";

    if (isBookmark && (bookmarks === undefined || bookmarks?.length < 1)) {
      return (
        <div
          css={css`
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <Typography
            size={22}
            weight={900}
            color={theme.colors.text.placeholder}
          >
            No bookmarked tokens
          </Typography>
        </div>
      );
    }

    const items = (
      isBookmark
        ? bookmarks?.map((b) => ({ address: b, isLP: false }))
        : addressList
    )?.map(({ address, isLP }) => {
      if (!isLP) {
        const asset = getAsset(address);
        const isVerified =
          !!verifiedAssets?.[address] ||
          isNativeTokenAddress(network.name, address);
        return (
          <AssetItem
            key={address}
            selected={selectedAssetAddress === address}
            invisible={
              !!deferredSearchKeyword &&
              [asset?.name, asset?.address, asset?.symbol].findIndex((item) =>
                item
                  ?.toLowerCase()
                  .includes(deferredSearchKeyword.toLowerCase()),
              ) < 0
            }
            onClick={() => {
              if (handleSelect) {
                handleSelect(address);
              }
              if (goBackOnSelect && onGoBack) {
                onGoBack();
              }
            }}
          >
            <IconButton
              size={32}
              style={{ alignItems: "center" }}
              icons={{
                default: bookmarks?.includes(address)
                  ? iconBookmarkSelected
                  : iconBookmark,
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(address);
              }}
            />
            <Row
              gutterWidth={6}
              style={{
                display: "flex",
                flex: 6,
                flexShrink: 0,
                alignItems: "center",
              }}
              justify="start"
              wrap="nowrap"
            >
              <Col
                xs="content"
                css={css`
                  vertical-align: middle;
                `}
              >
                <AssetIcon src={asset?.iconSrc}>
                  {isVerified && (
                    <Tooltip
                      arrow
                      content={`${asset?.symbol} is verified token`}
                    >
                      <div
                        css={css`
                          position: absolute;
                          bottom: -3px;
                          right: -3px;
                          width: 18px;
                          height: 18px;
                          background-image: url(${iconVerified});
                          background-size: contain;
                          background-repeat: no-repeat;
                          background-position: 50% 50%;
                        `}
                      />
                    </Tooltip>
                  )}
                </AssetIcon>
              </Col>
              <Col xs={8}>
                <Typography
                  size={16}
                  weight="bold"
                  color={theme.colors.text.primary}
                  css={css`
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  `}
                >
                  {asset?.symbol}
                </Typography>
                <Typography
                  size={13}
                  weight="normal"
                  color={theme.colors.text.primary}
                  css={css`
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    opacity: 0.5;
                  `}
                >
                  <span className="asset-name">{asset?.name}</span>
                  <span className="asset-address">
                    {ellipsisCenter(address, 6)}
                  </span>
                </Typography>
              </Col>
            </Row>
            <Typography
              size={16}
              css={css`
                overflow: hidden;
                white-space: nowrap;
                text-align: right;
                margin-left: auto;
                flex: 4;
              `}
            >
              {formatNumber(
                cutDecimal(
                  amountToValue(asset?.balance || 0, asset?.decimals) || 0,
                  3,
                ),
              )}
            </Typography>
          </AssetItem>
        );
      }

      const pair = findPairByLpAddress(address);
      const assets = pair?.asset_addresses.map((item) => getAsset(item)) || [];

      return (
        <AssetItem
          key={address}
          selected={selectedAssetAddress === address}
          invisible={
            !!deferredSearchKeyword &&
            (!address
              .toLowerCase()
              .includes(deferredSearchKeyword.toLowerCase()) ||
              assets.findIndex(
                (asset) =>
                  asset?.address
                    ?.toLowerCase()
                    .includes(deferredSearchKeyword.toLowerCase()) ||
                  asset?.symbol
                    ?.toLowerCase()
                    .includes(deferredSearchKeyword.toLowerCase()) ||
                  asset?.name
                    ?.toLowerCase()
                    .includes(deferredSearchKeyword.toLowerCase()),
              ) < 0)
          }
        >
          <div
            css={css`
              flex: 1;
            `}
          >
            <Row
              gutterWidth={3}
              justify="between"
              align="start"
              css={css`
                & > div:last-child {
                  display: none;
                }
              `}
            >
              {assets.map((asset) => (
                <React.Fragment key={asset?.address}>
                  <Col xs="content">
                    <AssetIcon
                      src={asset?.iconSrc}
                      css={css`
                        width: 20px;
                        height: 20px;
                      `}
                    />
                  </Col>
                  <Col
                    css={css`
                      flex: 1;
                    `}
                  >
                    <Typography
                      size={16}
                      weight={700}
                      color="white"
                      css={{ marginBottom: 3 }}
                    >
                      {asset?.name}
                    </Typography>
                  </Col>
                  <Col xs={12} sm="content">
                    <Hidden xs>
                      <Typography
                        size={16}
                        weight={700}
                        color="white"
                        css={{ marginBottom: 3 }}
                      >
                        &nbsp;-&nbsp;
                      </Typography>
                    </Hidden>
                  </Col>
                </React.Fragment>
              ))}
            </Row>
            <Row>
              <Col>
                <Typography
                  size={14}
                  weight={500}
                  color="white"
                  as="span"
                  css={{ wordBreak: "break-all" }}
                >
                  {ellipsisCenter(address, 10)}
                </Typography>
              </Col>
            </Row>
          </div>
        </AssetItem>
      );
    });

    return deferredSearchKeyword &&
      (items === undefined ||
        items?.filter((i) => !i.props.invisible)?.length < 1) ? (
      <Typography
        size={22}
        weight={900}
        color={theme.colors.text.placeholder}
        css={css`
          padding: 123px 0px;
          .${MOBILE_SCREEN_CLASS} {
            padding: 157px 0px;
          }
        `}
      >
        No result found
      </Typography>
    ) : (
      items
    );
  }, [
    bookmarks,
    deferredSearchKeyword,
    findPairByLpAddress,
    getAsset,
    goBackOnSelect,
    handleSelect,
    onGoBack,
    addressList,
    selectedAssetAddress,
    tabIdx,
    theme,
    toggleBookmark,
    network,
    verifiedAssets,
  ]);
  return (
    <Wrapper>
      <Panel border={false} style={{ paddingBottom: 0 }}>
        <Typography
          size={20}
          color={theme.colors.primary}
          weight={900}
          css={css`
            margin-bottom: 30px;
            position: relative;
          `}
        >
          {hasBackButton && (
            <IconButton
              icons={{ default: iconBack }}
              size={30}
              css={css`
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
              `}
              onClick={() => onGoBack && onGoBack()}
            />
          )}
          {title}
        </Typography>
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
        <Hr
          css={css`
            margin-top: 19px;
          `}
        />
        <Row
          justify="center"
          align="center"
          css={css`
            margin: 20px 0px;
          `}
          gutterWidth={0}
        >
          <Col width={194}>
            <TabButton
              selectedIndex={tabIdx}
              defaultSelectedIndex={tabIdx}
              items={tabs}
              onChange={(idx) => setTabIdx(idx)}
            />
          </Col>
        </Row>
        <Hr />
      </Panel>
      <AssetList>{assetList}</AssetList>
    </Wrapper>
  );
}

export default SelectAssetForm;
