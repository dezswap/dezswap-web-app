import { Col, Hidden, Row } from "react-grid-system";
import styled from "@emotion/styled";
import { css, useTheme } from "@emotion/react";
import React, { useDeferredValue, useMemo, useState } from "react";
import Typography from "components/Typography";
import { ellipsisCenter } from "utils";
import iconBack from "assets/icons/icon-back.svg";
import iconCopy from "assets/icons/icon-copy.svg";
import { Asset as OrgAsset } from "types/common";
import Copy from "components/Copy";
import iconToken from "assets/icons/icon-xpla-32px.svg";
import IconButton from "components/IconButton";
import Input from "components/Input";
import colors from "styles/theme/colors";
import Hr from "components/Hr";
import TabButton from "components/TabButton";
import Box from "components/Box";
import useAssets from "hooks/useAssets";
import usePairs from "hooks/usePair";

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
  background-color: ${colors.white};
  text-align: center;
`;

const AssetList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const AssetItem = styled.button<{ selected?: boolean; invisible?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: auto;
  position: relative;
  padding: 15px 16px;
  background-color: transparent;
  cursor: pointer;
  border: none;
  margin: 0;
  text-align: left;
  overflow: hidden;
  transition: all 0.125s cubic-bezier(0, 1, 0, 1);
  max-height: 1280px;

  &:hover {
    background-color: ${colors.text.background};
  }
  ${({ selected }) =>
    selected &&
    css`
      background-color: ${colors.text.background};
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

  /* Copy button */
  & button {
    opacity: 0;
    ${({ selected }) =>
      selected &&
      css`
        opacity: 1;
      `}
    .xs & {
      opacity: 1;
    }
  }

  &:hover button {
    opacity: 1;
  }
`;

AssetItem.defaultProps = {
  type: "button",
};

const AssetIcon = styled.div<{ src?: string }>`
  width: 40px;
  height: 40px;
  position: relative;
  display: inline-block;

  ${({ src = iconToken }) => css`
    background-image: url(${src});
  `};
  background-size: contain;
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;

function SelectAssetForm(props: SelectAssetFormProps) {
  const {
    title = "Select a Token",
    onSelect: handleSelect,
    selectedAssetAddress,
    hasBackButton,
    onGoBack,
    goBackOnSelect,
  } = props;
  const theme = useTheme();
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const { getAsset } = useAssets();
  const { findPairByLpAddress } = usePairs();

  const assetList = useMemo(() => {
    return props?.addressList?.map(({ address, isLP }) => {
      if (!isLP) {
        const asset = getAsset(address);
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
              [asset?.name, asset?.address, asset?.symbol].findIndex((item) =>
                item
                  ?.toLowerCase()
                  .includes(deferredSearchKeyword.toLowerCase()),
              ) < 0
            }
          >
            <Row gutterWidth={10} justify="between" align="start" wrap="nowrap">
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
                  css={{ marginBottom: 3 }}
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
            <Copy value={address}>
              <IconButton size={32} icons={{ default: iconCopy }} />
            </Copy>
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
    props,
    findPairByLpAddress,
    selectedAssetAddress,
    deferredSearchKeyword,
    getAsset,
    theme,
    handleSelect,
    goBackOnSelect,
    onGoBack,
  ]);
  return (
    <Wrapper>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            size={30 as any}
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
      <Box
        css={css`
          margin-bottom: 22px;
          padding: 12.5px;
        `}
      >
        <Input
          variant="primary"
          align="center"
          css={css`
            font-size: 16px;
            font-weight: bold;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: normal;
            text-align: justify;
          `}
          placeholder="Search name or paste address"
          onChange={(event) => {
            setSearchKeyword(event.target.value);
          }}
        />
      </Box>
      <Hr />
      <Row
        justify="center"
        align="center"
        css={css`
          display: flex;
        `}
      >
        <Col
          width={200}
          css={css`
            margin: 20px 0px;
          `}
        >
          <TabButton
            selectedIndex={0}
            defaultSelectedIndex={0}
            items={[
              { label: "All Tokens", value: "all tokens" },
              { label: "Bookmark", value: "boomark" },
            ]}
          />
        </Col>
      </Row>
      <Hr />
      <AssetList>{assetList}</AssetList>
    </Wrapper>
  );
}

export default SelectAssetForm;
