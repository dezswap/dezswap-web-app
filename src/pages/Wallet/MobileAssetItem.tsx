import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { type ComponentProps } from "react";
import { Col, Row } from "react-grid-system";

import iconBookmark from "~/assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "~/assets/icons/icon-bookmark-selected.svg";

import AssetIcon from "~/components/AssetIcon";
import Button from "~/components/Button";
import IconButton from "~/components/IconButton";
import Link from "~/components/Link";
import Typography from "~/components/Typography";
import AssetValueFormatter from "~/components/utils/AssetValueFormatter";
import CurrencyFormatter from "~/components/utils/CurrencyFormatter";
import HoverUnderline from "~/components/utils/HoverUnderline";

import Expand from "~/pages/Earn/Expand";

import { TokenWithBalanceAndValue } from "./Assets";

interface MobileAssetItemProps {
  asset: Partial<TokenWithBalanceAndValue>;
  isBookmarked?: boolean;
  onBookmarkClick?(asset: Partial<TokenWithBalanceAndValue>): void;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  flex: 1;
`;

const StyledLabel = styled(Typography)`
  margin-bottom: 6px;
`;
function Label({
  color = "primary",
  size = 14,
  weight = 900,
  ...props
}: ComponentProps<typeof StyledLabel>) {
  return <StyledLabel color={color} size={size} weight={weight} {...props} />;
}

const StyledValue = styled(Typography)``;
function Value({
  color = "primary",
  size = 16,
  weight = 500,
  ...props
}: ComponentProps<typeof StyledValue>) {
  return <StyledValue color={color} size={size} weight={weight} {...props} />;
}

function MobileAssetItem({
  asset,
  isBookmarked,
  onBookmarkClick,
}: MobileAssetItemProps) {
  return (
    <Expand
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Token</Label>
            <Row
              justify="between"
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
                <AssetIcon asset={asset} />
              </Col>
              <Col
                css={css`
                  min-width: 0;
                `}
              >
                <Value
                  css={css`
                    max-width: 100%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  `}
                >
                  <Link to={`/tokens/${encodeURIComponent(`${asset.token}`)}`}>
                    <HoverUnderline>{asset.name}</HoverUnderline>
                  </Link>
                </Value>
              </Col>
              <Col xs="content">
                <IconButton
                  size={32}
                  icons={{
                    default: isBookmarked ? iconBookmarkSelected : iconBookmark,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onBookmarkClick) {
                      onBookmarkClick(asset);
                    }
                  }}
                />
              </Col>
            </Row>
          </div>
          <div>
            <Label>Value</Label>
            <Value>
              <CurrencyFormatter value={asset.value} />
            </Value>
          </div>
        </Content>
      }
      hasDivider={false}
    >
      <Content>
        <div>
          <Label>Total Amount</Label>
          <Value>
            <AssetValueFormatter asset={asset} amount={asset.balance} />
          </Value>
        </div>
        {asset.token && (
          <div>
            <Link
              to={{
                pathname: "swap",
                search: new URLSearchParams({
                  q: asset.token,
                }).toString(),
              }}
            >
              <Button block variant="primary">
                Swap
              </Button>
            </Link>
          </div>
        )}
      </Content>
    </Expand>
  );
}

export default MobileAssetItem;
