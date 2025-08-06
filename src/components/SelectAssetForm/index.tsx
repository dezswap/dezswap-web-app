import { Col, Row } from "react-grid-system";
import styled from "@emotion/styled";
import { css, useTheme } from "@emotion/react";
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Typography from "components/Typography";
import Input from "components/Input";
import Hr from "components/Hr";
import TabButton from "components/TabButton";
import useAssets from "hooks/useAssets";
import useBookmark from "hooks/useBookmark";
import Panel from "components/Panel";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useNativeTokens from "hooks/useNativeTokens";
import { Token } from "types/api";
import AssetItem from "./AssetItem";

type Asset = Partial<Token & { disabled?: boolean }>;
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

const NoResult = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  left: 0;
  top: 0;
  justify-content: center;
  align-items: center;
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
  const deferredSearchKeyword = useDeferredValue(searchKeyword.toLowerCase());
  const { getAsset } = useAssets();
  const { bookmarks, toggleBookmark } = useBookmark();
  const [tabIdx, setTabIdx] = useState(0);
  const { nativeTokens } = useNativeTokens();
  const divRef = useRef<HTMLDivElement>(null);

  const assetList = useMemo(() => {
    const isBookmark = tabs[tabIdx].value === "bookmark";

    const addressListWithoutDuplicate = Array.from(
      new Set(addressList?.filter((address) => address)),
    );
    const filteredList = isBookmark
      ? addressListWithoutDuplicate?.filter((address) =>
          bookmarks?.includes(address),
        )
      : addressListWithoutDuplicate;

    if (isBookmark && !filteredList?.length) {
      return (
        <NoResult>
          <Typography
            size={22}
            weight={900}
            color={theme.colors.text.placeholder}
          >
            No bookmark found
          </Typography>
        </NoResult>
      );
    }

    const items = filteredList?.map((address) => {
      const asset = getAsset(address);
      const isVerified =
        asset?.verified || nativeTokens?.some((n) => n.token === address);
      return (
        <AssetItem
          key={address}
          asset={asset}
          selected={selectedAssetAddress === address}
          hidden={
            !asset?.symbol?.toLowerCase().includes(deferredSearchKeyword) &&
            !asset?.name?.toLowerCase().includes(deferredSearchKeyword)
          }
          isVerified={isVerified}
          onClick={() => {
            if (handleSelect) {
              handleSelect(address);
            }
          }}
          isBookmarked={bookmarks?.includes(address)}
          onBookmarkToggle={toggleBookmark}
        />
      );
    });

    return deferredSearchKeyword &&
      items.filter(
        (i: React.ReactElement<React.ComponentProps<typeof AssetItem>>) =>
          !i.props.hidden,
      )?.length < 1 ? (
      <NoResult>
        <Typography
          size={22}
          weight={900}
          color={theme.colors.text.placeholder}
        >
          No result found
        </Typography>
      </NoResult>
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
    nativeTokens,
  ]);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTo(0, 0);
    }
  }, [addressList?.length]);

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
      <AssetList ref={divRef}>
        <div
          css={css`
            position: relative;
            min-height: 100%;
            ${children &&
            tabIdx === 0 &&
            css`
              min-height: calc(100% - 72px);
            `}
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
