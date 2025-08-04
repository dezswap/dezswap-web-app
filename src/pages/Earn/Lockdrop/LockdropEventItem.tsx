import Box from "components/Box";
import styled from "@emotion/styled";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { Col, Hidden, Row, Visible, useScreenClass } from "react-grid-system";
import Button from "components/Button";
import { css } from "@emotion/react";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { LP_DECIMALS } from "constants/dezswap";
import {
  formatNumber,
  formatDecimals,
  amountToValue,
  formatDateTime,
  getRemainDays,
  getAddressLink,
} from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import iconVerified from "assets/icons/icon-verified.svg";
import iconAlarm from "assets/icons/icon-alarm.svg";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import iconBadge from "assets/icons/icon-badge.svg";

import useAsset from "hooks/useAsset";
import useNetwork from "hooks/useNetwork";
import usePairs from "hooks/usePairs";
import { useMemo } from "react";
import ProgressBar from "components/ProgressBar";
import { LockdropEvent, LockdropUserInfo } from "types/lockdrop";
import IconButton from "components/IconButton";
import Hr from "components/Hr";
import { Numeric } from "@xpla/xpla.js";
import Link from "components/Link";
import Outlink from "components/Outlink";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import Expand from "../Expand";

const Wrapper = styled(Box)<{ isNeedAction?: boolean }>`
  padding: 2px;
  border-radius: 14px;
  ${({ isNeedAction, theme }) =>
    isNeedAction &&
    css`
      background-image: ${theme.colors.gradient};
    `}

  a:has(button:disabled) {
    pointer-events: none;
  }
`;

const TableRow = styled(Box)`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 18px;
  background: none;
  gap: 20px;
  & > div {
    position: relative;
    width: 240px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;
    &:first-of-type {
      width: 32px;
    }
    &:last-of-type {
      width: 116px;
    }

    & > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .${MOBILE_SCREEN_CLASS} &,
      .${TABLET_SCREEN_CLASS} & {
        overflow: unset;
        white-space: normal;
        text-overflow: unset;
        word-break: break-all;
      }
    }
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    gap: 20px;

    & > div {
      width: 100%;
      &:first-of-type {
        width: 100%;
      }
    }
  }
`;

const Label = styled(Typography)`
  line-height: 1;
  white-space: nowrap;
  margin-bottom: 15px;
  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    margin-bottom: 6px;
  }
`;

Label.defaultProps = {
  color: "primary",
  weight: 900,
};

const AssetIcon = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: inline-block;
  &::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    background-image: ${({ src }) => `url(${src || iconDefaultToken})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  }
`;

const BodyWrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 40px;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    display: block;

    & > div {
      &:first-of-type {
        margin-bottom: 16px;
      }
    }
  }
`;

const OutlinkList = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;

  width: auto;
  height: auto;
  position: relative;

  gap: 10px;
`;

const VerifiedBadge = styled.div`
  display: inline-block;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 5px 10px;
  border-radius: 30px;

  &::before {
    content: "";
    display: inline-block;
    width: 18px;
    height: 18px;
    position: relative;
    margin-right: 2px;
    background-image: url(${iconVerified});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    line-height: 19px;
    vertical-align: middle;
  }

  &::after {
    content: "Verified";
    font-size: 14px;
    font-weight: 900;
    line-height: 19px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LockdropUserInfoItem = styled(Box)`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;

  & > div {
    &,
    & *:not([type="button"]) {
      color: ${({ theme }) => theme.colors.primary};
    }

    &:first-of-type {
      flex: 1;
    }
    &:last-of-type {
      width: 150px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    gap: 20px;

    & > div {
      &:first-of-type {
        width: 100%;
      }
      &:last-of-type {
        width: 100%;
      }
    }
  }
`;

function LockdropUserInfoTable({
  data,
}: {
  data: {
    label: string;
    value: string;
    tooltip?: React.ReactNode;
  }[];
}) {
  return (
    <Row
      justify="between"
      align="start"
      gutterWidth={20}
      css={css`
        .${MOBILE_SCREEN_CLASS} &,
        .${TABLET_SCREEN_CLASS} & {
          gap: 16px;
        }
      `}
    >
      {data.map(({ label, value, tooltip }) => (
        <Col xs={12} md={12 / data.length}>
          <Typography
            color="primary"
            size={14}
            weight={900}
            css={css`
              margin-bottom: 15px;
              .${MOBILE_SCREEN_CLASS} &,
              .${TABLET_SCREEN_CLASS} & {
                margin-bottom: 6px;
              }
            `}
          >
            {label}
            {tooltip && <TooltipWithIcon size={22} content={tooltip} />}
          </Typography>
          <Typography color="primary" size={14} weight={400}>
            {value}
          </Typography>
        </Col>
      ))}
    </Row>
  );
}

function LockdropEventItem({
  event: lockdropEvent,
  isBookmarked,
  onBookmarkToggle,
  userInfo: lockdropUserInfo,
  isUpcoming,
}: {
  event: LockdropEvent;
  userInfo?: LockdropUserInfo;
  isBookmarked?: boolean;
  onBookmarkToggle?: (isBookmarked: boolean, eventAddress: string) => void;
  isUpcoming?: boolean;
}) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );

  const {
    selectedChain: { explorers },
  } = useNetwork();
  const { findPairByLpAddress } = usePairs();
  const pair = useMemo(
    () => findPairByLpAddress(lockdropEvent.lp_token_addr),
    [findPairByLpAddress, lockdropEvent],
  );

  const { data: asset1 } = useAsset(pair?.asset_addresses?.[0]);
  const { data: asset2 } = useAsset(pair?.asset_addresses?.[1]);
  const { data: rewardAsset } = useAsset(lockdropEvent.reward_token_addr);
  const isStakable = useMemo(() => {
    const startAt = new Date(lockdropEvent.start_at * 1000);
    const endAt = new Date(lockdropEvent.end_at * 1000);
    const now = new Date();

    return now >= startAt && now <= endAt;
  }, [lockdropEvent]);

  const isCancelable = useMemo(() => {
    const cancelableUntil = new Date(lockdropEvent.cancelable_until * 1000);
    const now = new Date();

    return now <= cancelableUntil;
  }, [lockdropEvent]);

  const isNeedAction = useMemo(() => {
    return lockdropUserInfo?.lockup_infos?.some(
      (info) =>
        Numeric.parse(info.claimable).gt(0) ||
        (Numeric.parse(info.locked_lp_token).gt(0) &&
          new Date() > new Date(info.unlock_second * 1000)),
    );
  }, [lockdropUserInfo]);

  const needActionBadge = useMemo(
    () =>
      isNeedAction ? (
        <Tooltip content="Action required!">
          <IconButton size={18} icons={{ default: iconBadge }} />
        </Tooltip>
      ) : null,
    [isNeedAction],
  );

  const extra = useMemo(
    () =>
      isStakable || isUpcoming
        ? [
            <Link to={lockdropEvent.addr} relative="route">
              <Button variant="primary" block disabled={isUpcoming}>
                Lock LP
              </Button>
            </Link>,
          ]
        : [],
    [isStakable, isUpcoming, lockdropEvent],
  );

  const bookmarkButton = useMemo(
    () => (
      <IconButton
        size={32}
        style={{ alignItems: "center" }}
        icons={{
          default: isBookmarked ? iconBookmarkSelected : iconBookmark,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onBookmarkToggle && lockdropEvent.addr) {
            onBookmarkToggle(!isBookmarked, lockdropEvent.addr);
          }
        }}
      />
    ),
    [isBookmarked, lockdropEvent, onBookmarkToggle],
  );

  /* 
  * lockdropAction callback is temporarily disabled as it's not being used
  * - Uncomment when needed
  * 
  * const lockdropAction = useCallback(
  *   async (messageType: "cancel" | "claim" | "unstake", duration: number) => {
  *     if (!walletAddress) {
  *       return;
  *     }
  *     const generateMsg = {
  *       cancel: generateCancelLockdropMsg,
  *       claim: generateClaimLockdropMsg,
  *       unstake: generateUnstakeLockdropMsg,
  *     };

  *     const txOptions: MsgExecuteContract = generateMsg[messageType]({
  *       senderAddress: walletAddress,
  *       contractAddress: lockdropEvent.addr,
  *       duration,
  *     });

  *     const fee = await api.estimateFee(txOptions, sequence);

  *     if (fee) {
  *       requestPost({
  *         txOptions:  { msgs: txOptions },
  *         fee,
  *         skipConfirmation: true,
  *       });
  *     }
  *   },
  *   [api, walletAddress, lockdropEvent.addr, requestPost],
  * );
  */
  return (
    <Wrapper isNeedAction={isNeedAction}>
      <Expand
        header={
          <TableRow>
            <Hidden xs sm>
              <div
                css={css`
                  margin-right: -10px;
                `}
              >
                {bookmarkButton}
              </div>
            </Hidden>
            <div>
              {isSmallScreen && <Label>Pool</Label>}
              <Row justify="between" align="center" gutterWidth={0}>
                <Col xs="content">
                  <Row
                    justify="start"
                    align="center"
                    gutterWidth={6}
                    wrap="nowrap"
                  >
                    <Col
                      width="auto"
                      css={css`
                        white-space: nowrap;
                        line-height: 1;
                        font-size: 0;
                      `}
                    >
                      <AssetIcon src={asset1?.icon} />
                      <AssetIcon
                        src={asset2?.icon}
                        css={css`
                          margin-left: -9px;
                        `}
                      />
                    </Col>
                    <Tooltip content={`${asset1?.symbol}-${asset2?.symbol}`}>
                      <Col
                        width="auto"
                        css={css`
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                        `}
                      >
                        {asset1?.symbol}-{asset2?.symbol}
                      </Col>
                    </Tooltip>
                  </Row>
                </Col>
                <Visible xs sm>
                  <Col xs="content">{bookmarkButton}</Col>
                </Visible>
              </Row>
            </div>
            <div>
              {isSmallScreen && <Label>Allocation</Label>}
              <div>
                <AssetValueFormatter
                  asset={rewardAsset}
                  amount={lockdropEvent.total_reward}
                />
              </div>
            </div>
            <div>
              {isSmallScreen && <Label>Total Staked LP</Label>}
              <div>
                <AssetValueFormatter
                  asset={{ decimals: LP_DECIMALS, symbol: "LP" }}
                  amount={lockdropEvent.total_locked_lp}
                />
              </div>
            </div>
            <div>
              {isSmallScreen && (
                <Label>
                  <Row justify="between" align="center">
                    <Col xs="content">
                      {isUpcoming ? "Event Starts In" : "Event Ends In"}
                    </Col>
                    <Col xs="content">{needActionBadge}</Col>
                  </Row>
                </Label>
              )}
              <div>
                {getRemainDays(
                  (isUpcoming ? lockdropEvent.start_at : lockdropEvent.end_at) *
                    1000,
                )}
                &nbsp;days
                <Tooltip
                  content={
                    <>
                      <Typography size={14} weight={900} color="primary">
                        Event Period
                      </Typography>
                      <Typography size={14} weight={700} color="primary">
                        {formatDateTime(lockdropEvent.start_at * 1000)} ~ <br />
                        {formatDateTime(lockdropEvent.end_at * 1000)}
                      </Typography>
                      <Hr
                        css={css`
                          margin: 10px 0;
                        `}
                      />
                      <Typography size={14} weight={900} color="primary">
                        Lock begins at
                      </Typography>
                      <Typography size={14} weight={700} color="primary">
                        {formatDateTime(lockdropEvent.end_at * 1000)}
                      </Typography>
                      <Hr
                        css={css`
                          margin: 10px 0;
                        `}
                      />
                      <Typography size={12} weight={500}>
                        Cancellation is available
                        <br />
                        until&nbsp;
                        {formatDateTime(lockdropEvent.cancelable_until * 1000)}
                      </Typography>
                    </>
                  }
                >
                  <IconButton
                    size={20}
                    icons={{ default: iconAlarm }}
                    css={css`
                      vertical-align: middle;
                      margin-left: 2px;
                    `}
                  />
                </Tooltip>
              </div>
              {!isSmallScreen && (
                <div
                  css={css`
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    line-height: 1;
                    font-size: 0;
                  `}
                >
                  {needActionBadge}
                </div>
              )}
            </div>

            {isSmallScreen && !!extra.length && <div>{extra}</div>}
          </TableRow>
        }
        extra={!isSmallScreen ? extra : undefined}
      >
        <BodyWrapper>
          <OutlinkList>
            <Outlink>Project Site</Outlink>
            <Outlink
              href={getAddressLink(lockdropEvent.addr, explorers?.[0].url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contract Info
            </Outlink>
            <Tooltip content="Verified by Dezswap">
              <VerifiedBadge />
            </Tooltip>
          </OutlinkList>

          <div
            css={css`
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 10px;
            `}
          >
            {!lockdropUserInfo?.lockup_infos?.length ? (
              <LockdropUserInfoItem>
                <div>
                  <LockdropUserInfoTable
                    data={[
                      {
                        label: "Your Staked LP",
                        value: "0",
                      },
                      {
                        label: "Rewards",
                        tooltip:
                          "The amount for Rewards may vary due to the composition of the pool changes during the Lock&Drop event period. It will be fixed when the event is over.",
                        value: `0 ${rewardAsset?.symbol}`,
                      },
                      {
                        label: "Claimable",
                        value: `0 ${rewardAsset?.symbol}`,
                      },
                      {
                        label: "Claimed",
                        value: `0 ${rewardAsset?.symbol}`,
                      },
                    ]}
                  />
                </div>
                <Hidden xs sm>
                  <div>&nbsp;</div>
                </Hidden>
              </LockdropUserInfoItem>
            ) : (
              lockdropUserInfo.lockup_infos.map((lockupInfo) => {
                const eventEndAt = new Date(lockdropEvent.end_at * 1000);
                const unlockAt = new Date(lockupInfo.unlock_second * 1000);
                const now = new Date();

                const isClaimable = Numeric.parse(lockupInfo.claimable || 0).gt(
                  0,
                );
                const isUnstakable = now >= unlockAt;
                const isLocking = now > eventEndAt && now < unlockAt;

                return (
                  <LockdropUserInfoItem>
                    <div>
                      <Row
                        justify="between"
                        align="start"
                        css={css`
                          margin-bottom: 15px;
                          gap: 16px;
                        `}
                      >
                        <Col xs={12} md="content">
                          <Typography weight={900} size={14}>
                            Lock Period
                            <Hidden xs sm>
                              :&nbsp;
                            </Hidden>
                            <Visible xs sm>
                              <br />
                            </Visible>
                            <span
                              css={css`
                                font-weight: 400;
                              `}
                            >
                              {formatDateTime(lockdropEvent.end_at * 1000)}
                              &nbsp; -&nbsp;
                              {formatDateTime(
                                lockupInfo.unlock_second * 1000,
                              )}{" "}
                              ({lockupInfo.duration} weeks)
                            </span>
                          </Typography>
                        </Col>
                        <Col xs={12} md="content">
                          <Typography weight={900} size={14}>
                            Remaining
                            <Hidden xs sm>
                              :&nbsp;
                            </Hidden>
                            <Visible xs sm>
                              <br />
                            </Visible>
                            <span
                              css={css`
                                font-weight: 400;
                              `}
                            >
                              {getRemainDays(lockupInfo.unlock_second * 1000)}
                              &nbsp;days
                            </span>
                          </Typography>
                        </Col>
                      </Row>
                      <div
                        css={css`
                          margin-bottom: 19px;
                        `}
                      >
                        <ProgressBar
                          variant="gradient"
                          size="small"
                          barStyle="rounded"
                          min={lockdropEvent.end_at}
                          max={lockupInfo.unlock_second}
                          value={new Date().getTime() / 1000}
                        />
                      </div>
                      <Hr
                        css={css`
                          margin-bottom: 20px;
                        `}
                      />
                      <LockdropUserInfoTable
                        data={[
                          {
                            label: "Your Staked LP",
                            value:
                              formatNumber(
                                formatDecimals(
                                  amountToValue(
                                    lockupInfo.locked_lp_token || 0,
                                    LP_DECIMALS,
                                  ) || "",
                                  2,
                                ),
                              ) || "",
                          },
                          {
                            label: "Rewards",
                            tooltip:
                              "The amount for Rewards may vary due to the composition of the pool changes during the Lock&Drop event period. It will be fixed when the event is over.",
                            value: `${formatNumber(
                              formatDecimals(
                                amountToValue(
                                  lockupInfo.total_reward || 0,
                                  rewardAsset?.decimals,
                                ) || "",
                                2,
                              ),
                            )} ${rewardAsset?.symbol}`,
                          },
                          {
                            label: "Claimable",
                            value: `${formatNumber(
                              formatDecimals(
                                amountToValue(
                                  lockupInfo.claimable || 0,
                                  rewardAsset?.decimals,
                                ) || "",
                                2,
                              ),
                            )} ${rewardAsset?.symbol}`,
                          },
                          {
                            label: "Claimed",
                            value: `${formatNumber(
                              formatDecimals(
                                amountToValue(
                                  lockupInfo.claimed || 0,
                                  rewardAsset?.decimals,
                                ) || "",
                                2,
                              ),
                            )} ${rewardAsset?.symbol}`,
                          },
                        ]}
                      />
                    </div>
                    <div>
                      {isStakable && (
                        <Link
                          to={`${lockdropEvent.addr}?duration=${lockupInfo.duration}`}
                          relative="route"
                        >
                          <Button as="div" variant="primary" block>
                            Lock more LP
                          </Button>
                        </Link>
                      )}
                      {isStakable && (
                        <Link
                          to={`${lockdropEvent.addr}/cancel?duration=${lockupInfo.duration}`}
                          relative="route"
                        >
                          <Button
                            variant="secondary"
                            block
                            disabled={!isCancelable}
                          >
                            Cancel
                          </Button>
                        </Link>
                      )}
                      {(isLocking || isUnstakable) && (
                        <Link
                          to={`${lockdropEvent.addr}/claim?duration=${lockupInfo.duration}`}
                          relative="route"
                        >
                          <Button
                            variant="primary"
                            block
                            disabled={
                              !isClaimable ||
                              Numeric.parse(lockupInfo.claimable || 0).lte(0)
                            }
                          >
                            Claim
                          </Button>
                        </Link>
                      )}
                      {(isLocking || isUnstakable) && (
                        <Link
                          to={`${lockdropEvent.addr}/unlock?duration=${lockupInfo.duration}`}
                          relative="route"
                        >
                          <Button
                            variant="secondary"
                            block
                            disabled={
                              isLocking ||
                              Numeric.parse(
                                lockupInfo.locked_lp_token || 0,
                              ).lte(0)
                            }
                          >
                            Unlock
                          </Button>
                        </Link>
                      )}
                    </div>
                  </LockdropUserInfoItem>
                );
              })
            )}
          </div>
        </BodyWrapper>
      </Expand>
    </Wrapper>
  );
}

export default LockdropEventItem;
