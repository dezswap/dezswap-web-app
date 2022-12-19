import { Col, Hidden, Row } from "react-grid-system";
import styled from "@emotion/styled";
import { css, useTheme } from "@emotion/react";
import React, { useDeferredValue, useMemo, useState } from "react";
import Typography from "components/Typography";
import { amountToValue, cutDecimal, ellipsisCenter } from "utils";
import iconBack from "assets/icons/icon-back.svg";
import { Asset as OrgAsset } from "types/common";
import iconToken from "assets/icons/icon-xpla-32px.svg";
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
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  text-align: center;
  border-radius: 12px;

  .${MOBILE_SCREEN_CLASS} & {
    max-height: calc(80vh - 6px);
  }
`;

const AssetList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const AssetItem = styled.button<{ selected?: boolean; invisible?: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  height: auto;
  position: relative;
  padding: 15px 27px;
  .xs & {
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

  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
  }
  ${({ selected, theme }) =>
    selected &&
    css`
      background-color: ${theme.colors.text.background};
    `}
  ${({ invisible }) =>
    invisible &&
    css`
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;
      pointer-events: none;
    `}
`;

AssetItem.defaultProps = {
  type: "button",
};

const AssetIcon = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: inline-block;

  ${({ src = iconToken }) => css`
    background-image: url(${src});
  `};
  background-size: contain;
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;

const tabs = [
  { label: "All", value: "all" },
  { label: "Bookmark", value: "bookmark" },
];

function SelectAssetForm(props: SelectAssetFormProps) {
  const {
    title = "Select a Token",
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
  const { getAsset } = useAssets();
  const { findPairByLpAddress } = usePairs();
  const { bookmarks, toggleBookmark } = useBookmark();
  const [tabIdx, setTabIdx] = useState(0);

  const assetList = useMemo(() => {
    return (
      tabs[tabIdx].value === "bookmark"
        ? bookmarks?.map((b) => ({ address: b, isLP: false }))
        : addressList
    )?.map(({ address, isLP }) => {
      if (!isLP) {
        const asset = getAsset(address);
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
          >
            <IconButton
              size={32}
              style={{ alignItems: "center", marginBottom: "5px" }}
              icons={{
                default: bookmarks?.includes(address)
                  ? iconBookmarkSelected
                  : iconBookmark,
              }}
              onClick={() => toggleBookmark(address)}
            />
            <Row
              gutterWidth={6}
              style={{ display: "flex", flexGrow: 1, alignItems: "center" }}
              justify="start"
              onClick={() => {
                if (handleSelect) {
                  handleSelect(address);
                }
                if (goBackOnSelect && onGoBack) {
                  onGoBack();
                }
              }}
            >
              <Col xs="content">
                <AssetIcon src={asset?.iconSrc} />
              </Col>
              <Col
                css={css`
                  flex: 1;
                `}
              >
                <Typography
                  size={16}
                  weight="bold"
                  color={theme.colors.text.primary}
                >
                  {asset?.name}
                </Typography>
                <Typography
                  size={12}
                  weight="normal"
                  color={theme.colors.text.primary}
                  as="span"
                  css={{ wordBreak: "break-all", opacity: 0.5 }}
                >
                  {address?.length > 23 ? ellipsisCenter(address, 10) : address}
                </Typography>
              </Col>
            </Row>
            <Typography>
              {cutDecimal(
                amountToValue(asset?.balance || 0, asset?.decimals) || 0,
                3,
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
          onClick={() => {
            if (handleSelect) {
              handleSelect(address);
            }
            if (goBackOnSelect && onGoBack) {
              onGoBack();
            }
          }}
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
          align="center"
          style={{ fontSize: "16px", fontWeight: "bold" }}
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
