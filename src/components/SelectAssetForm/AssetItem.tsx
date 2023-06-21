import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useBalance from "hooks/useBalance";
import useIsInViewport from "hooks/useIsInViewport";
import { useRef } from "react";
import { Token } from "types/api";
import { formatNumber, cutDecimal, amountToValue, ellipsisCenter } from "utils";

import iconToken from "assets/icons/icon-default-token.svg";
import iconVerified from "assets/icons/icon-verified.svg";
import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";

interface WrapperProps {
  selected?: boolean;
  invisible?: boolean;
}
const Wrapper = styled.div<WrapperProps>`
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

interface AssetIconProps {
  src?: string;
}
const AssetIcon = styled.div<AssetIconProps>`
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

function Balance({ asset }: { asset?: Partial<Token> }) {
  const balance = useBalance(asset?.token);
  return (
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
        cutDecimal(amountToValue(balance || 0, asset?.decimals) || 0, 3),
      )}
    </Typography>
  );
}

function AssetItem({
  asset,
  selected,
  hidden,
  onClick,
  isBookmarked,
  isVerified,
  onBookmarkToggle,
}: {
  asset?: Partial<Token>;
  selected?: boolean;
  hidden?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  isVerified?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (address: string) => void;
}) {
  const theme = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIsInViewport(wrapperRef);
  return (
    <Wrapper
      ref={wrapperRef}
      selected={selected}
      invisible={hidden}
      onClick={onClick}
    >
      <IconButton
        size={32}
        style={{ alignItems: "center" }}
        icons={{
          default: isBookmarked ? iconBookmarkSelected : iconBookmark,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onBookmarkToggle && asset?.token) {
            onBookmarkToggle(asset?.token);
          }
        }}
      />

      <AssetIcon src={asset?.icon}>
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
              {ellipsisCenter(asset?.token, 6)}
            </span>
          </Typography>
        </div>
        {isIntersecting && <Balance asset={asset} />}
      </div>
    </Wrapper>
  );
}

export default AssetItem;
