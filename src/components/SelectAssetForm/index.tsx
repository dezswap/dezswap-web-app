import { Col, Row } from "react-grid-system";
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
import { Asset as OrgAsset } from "types/common";
import iconToken from "assets/icons/icon-default-token.svg";
import iconVerified from "assets/icons/icon-verified.svg";
import IconButton from "components/IconButton";
import Input from "components/Input";
import Hr from "components/Hr";
import TabButton from "components/TabButton";
import useAssets from "hooks/useAssets";
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

type SelectAssetFormProps = React.PropsWithChildren<{
  selectedAssetAddress?: string;
  onSelect?(address: string): void;
  addressList?: string[];
}>;

const Wrapper = styled.div`
  width: 100%;
  height: calc(min(60vh, 690px) - 78px);
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  text-align: center;
  border-radius: 12px;
  min-height: 422px;

  .${MOBILE_SCREEN_CLASS} & {
    min-height: unset;
    max-height: unset;
    height: calc(80vh - 70px);
  }
`;

const AssetList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;

  &::-webkit-scrollbar-track {
    margin-bottom: 10px;
  }
`;

const AssetItem = styled.div<{ selected?: boolean; invisible?: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  column-gap: 6px;

  width: 100%;
  max-width: 100%;
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
  min-width: 32px;
  min-height: 32px;
  position: relative;
  display: inline-block;
  padding: 0px 6px;

  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;

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
    onSelect: handleSelect,
    selectedAssetAddress,
    addressList,
    children,
  } = props;
  const theme = useTheme();
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const { getAsset, verifiedAssets } = useAssets();
  const { bookmarks, toggleBookmark } = useBookmark();
  const network = useNetwork();
  const [tabIdx, setTabIdx] = useState(0);

  const assetList = useMemo(() => {
    const isBookmark = tabs[tabIdx].value === "bookmark";

    const filteredList = isBookmark
      ? addressList?.filter((address) => bookmarks?.includes(address))
      : addressList;

    if (isBookmark && !filteredList?.length) {
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
            No bookmark found
          </Typography>
        </div>
      );
    }

    const items = filteredList?.map((address) => {
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
              item?.toLowerCase().includes(deferredSearchKeyword.toLowerCase()),
            ) < 0
          }
          onClick={() => {
            if (handleSelect) {
              handleSelect(address);
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

          <AssetIcon src={asset?.iconSrc}>
            {isVerified && (
              <Tooltip arrow content={`${asset?.symbol} is verified token`}>
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
          <div
            css={css`
              min-width: 0;
              display: block;
              flex: 1;
              flex-shrink: 0;
              flex-basis: 0;
              position: relative;
              & > div {
                display: inline-block;
                vertical-align: middle;
              }
            `}
          >
            <div
              css={css`
                width: 50%;
                max-width: 50%;
                font-size: 0;
                line-height: 1;
                padding-right: 10px;
              `}
            >
              <Typography
                size={16}
                weight="bold"
                color={theme.colors.text.primary}
                css={css`
                  display: block;
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
                  display: block;
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
            </div>
            <Typography
              size={16}
              css={css`
                width: 50%;
                max-width: 50%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: right;
                padding-left: 10px;
              `}
            >
              {formatNumber(
                cutDecimal(
                  amountToValue(asset?.balance || 0, asset?.decimals) || 0,
                  3,
                ),
              )}
            </Typography>
          </div>
        </AssetItem>
      );
    });

    return deferredSearchKeyword &&
      (items === undefined ||
        items?.filter((i) => !i.props.invisible)?.length < 1) ? (
      <div
        css={css`
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          ${children &&
          css`
            height: calc(100% - 72px);
          `}
        `}
      >
        <Typography
          size={22}
          weight={900}
          color={theme.colors.text.placeholder}
        >
          No result found
        </Typography>
      </div>
    ) : (
      items
    );
  }, [
    bookmarks,
    deferredSearchKeyword,
    getAsset,
    handleSelect,
    addressList,
    selectedAssetAddress,
    tabIdx,
    theme,
    toggleBookmark,
    network,
    verifiedAssets,
    children,
  ]);
  return (
    <Wrapper>
      <Panel border={false} style={{ paddingTop: 0, paddingBottom: 0 }}>
        {/* <Typography
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
        </Typography> */}
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
      <AssetList>
        <div
          css={css`
            min-height: calc(100% - 72px);
          `}
        >
          {assetList}
        </div>
        {tabIdx === 0 && children}
      </AssetList>
    </Wrapper>
  );
}

export default SelectAssetForm;
