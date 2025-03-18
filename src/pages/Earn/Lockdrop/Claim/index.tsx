import Modal from "components/Modal";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import { Col, Row, useScreenClass } from "react-grid-system";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAssets from "hooks/useAssets";
import iconLink from "assets/icons/icon-link.svg";
import { useCallback, useEffect, useMemo } from "react";
import box from "components/Box";
import Typography from "components/Typography";
import { css } from "@emotion/react";
import Expand from "components/Expanded";
import InfoTable from "components/InfoTable";
import useLockdropEvents from "hooks/useLockdropEvents";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatDecimals,
  formatNumber,
  getTokenLink,
} from "utils";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import { generateClaimLockdropMsg } from "utils/dezswap";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { AccAddress, CreateTxOptions, Numeric } from "@xpla/xpla.js";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import useNetwork from "hooks/useNetwork";
import useAPI from "hooks/useAPI";
import Button from "components/Button";
import useRequestPost from "hooks/useRequestPost";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import IconButton from "components/IconButton";
import usePairs from "hooks/usePairs";
import useConnectedWallet from "hooks/useConnectedWallet";

const Box = styled(box)`
  & > * {
    margin-bottom: 5px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
`;

function ClaimPage() {
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { eventAddress } = useParams<{ eventAddress?: string }>();
  const [searchParams] = useSearchParams();
  const {
    selectedChain: { chainId, explorers },
  } = useNetwork();
  const { walletAddress } = useConnectedWallet();

  const { getLockdropEventInfo } = useLockdropEvents();
  const api = useAPI();

  const { findPairByLpAddress } = usePairs();
  const { getAsset } = useAssets();

  const { data: lockdropEventInfo, error: lockdropEventInfoError } = useQuery({
    queryKey: ["lockdropEventInfo", eventAddress, chainId],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await getLockdropEventInfo(eventAddress);
      return res;
    },
  });

  const { data: lockdropUserInfo, error: lockdropUserInfoError } = useQuery({
    queryKey: ["lockdropUserInfo", eventAddress, chainId],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await api.getLockdropUserInfo(eventAddress);
      return res || null;
    },
  });

  const duration = useMemo(() => {
    const value = searchParams.get("duration");
    return value ? Number(value) : undefined;
  }, [searchParams]);

  const pair = useMemo(
    () =>
      lockdropEventInfo
        ? findPairByLpAddress(lockdropEventInfo.lp_token_addr)
        : undefined,
    [findPairByLpAddress, lockdropEventInfo],
  );

  const lockupInfo = useMemo(() => {
    return lockdropUserInfo?.lockup_infos.find(
      (item) => item.duration === duration,
    );
  }, [duration, lockdropUserInfo]);

  const [asset1, asset2] = useMemo(
    () => pair?.asset_addresses.map((address) => getAsset(address)) || [],
    [getAsset, pair],
  );

  const rewardAsset = useMemo(
    () => getAsset(lockdropEventInfo?.reward_token_addr || ""),
    [getAsset, lockdropEventInfo],
  );

  const txOptions = useMemo<CreateTxOptions | undefined>(() => {
    if (!walletAddress || !eventAddress || !duration) {
      return undefined;
    }
    return {
      msgs: [
        generateClaimLockdropMsg({
          senderAddress: walletAddress,
          contractAddress: eventAddress,
          duration,
        }),
      ],
    };
  }, [walletAddress, duration, eventAddress]);

  const { fee } = useFee(txOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const handleModalClose = useCallback(() => {
    navigate("../..", { relative: "route" });
  }, [navigate]);

  const invalidPathModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const { requestPost } = useRequestPost(handleModalClose);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (!txOptions || !fee) {
        return;
      }
      requestPost({ txOptions, fee, skipConfirmation: true });
    },
    [fee, requestPost, txOptions],
  );

  useEffect(() => {
    if (
      !AccAddress.validate(eventAddress || "") ||
      lockdropEventInfoError ||
      lockdropUserInfoError ||
      (!lockdropEventInfoError &&
        !lockdropUserInfoError &&
        lockdropUserInfo &&
        !lockupInfo) ||
      (lockupInfo && Numeric.parse(lockupInfo?.claimable).lte(0))
    ) {
      invalidPathModal.open();
    }
  }, [
    eventAddress,
    invalidPathModal,
    lockdropEventInfoError,
    lockdropUserInfoError,
    lockdropUserInfo,
    lockupInfo,
  ]);

  return (
    <Modal
      id="claim-modal"
      className="modal-parent"
      isOpen={!!lockdropEventInfo}
      title="Claim Reward"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={() => handleModalClose()}
    >
      <form
        onSubmit={handleSubmit}
        css={css`
          & > * {
            margin-bottom: 10px;
          }
        `}
      >
        <Box>
          <Row justify="between" align="start">
            <Col xs="content">
              {/* TODO: add tooltip */}
              <Typography color="primary" weight={900} size={14}>
                Claimable Rewards
                <TooltipWithIcon content="Lorem ipsum" size={22} />
              </Typography>
            </Col>
          </Row>

          <Typography
            size={14}
            weight={700}
            css={css`
              text-align: right;
            `}
          >
            <Typography
              size={22}
              weight={900}
              css={css`
                display: inline-block;
              `}
            >
              {lockupInfo
                ? formatNumber(
                    formatDecimals(
                      amountToValue(
                        lockupInfo.claimable || 0,
                        rewardAsset?.decimals,
                      ) || "",
                      2,
                    ),
                  )
                : ""}
            </Typography>
            &nbsp;{rewardAsset?.symbol}
          </Typography>

          <Row>
            <Col xs={24}>
              <Typography
                size={14}
                css={css`
                  opacity: 0.7;
                  text-align: right;
                `}
              >
                -
              </Typography>
            </Col>
          </Row>
        </Box>
        <div
          css={css`
            padding-bottom: 10px;
          `}
        >
          <Expand
            label={
              <Typography weight="bold">
                {asset1?.symbol || ""} - {asset2?.symbol || ""}
              </Typography>
            }
            preview={
              <InfoTable
                items={[
                  {
                    key: "fee",
                    label: "Fee",
                    tooltip: "The fee paid for executing the transaction.",
                    value: feeAmount
                      ? `${formatNumber(
                          cutDecimal(
                            amountToValue(feeAmount) || "0",
                            DISPLAY_DECIMAL,
                          ),
                        )} ${XPLA_SYMBOL}`
                      : "",
                  },
                  {
                    key: "shareOfPool",
                    label: `Share of pool’s ${rewardAsset?.symbol} Rewards`,
                    value: `${cutDecimal(
                      Numeric.parse(lockupInfo?.total_reward || "0")
                        .dividedBy(
                          lockdropEventInfo?.total_lockdrop_reward || "1",
                        )
                        .mul(100)
                        .toString(),
                      2,
                    )}%`,
                  },
                ]}
              />
            }
          >
            <div
              css={css`
                margin-top: 3px;
              `}
            >
              <InfoTable
                items={[
                  {
                    key: "lpAddress",
                    label: "LP Address",
                    value: (
                      <span>
                        {ellipsisCenter(lockdropEventInfo?.lp_token_addr, 6)}
                        &nbsp;
                        <a
                          href={getTokenLink(
                            lockdropEventInfo?.lp_token_addr,
                            explorers?.[0].url,
                          )}
                          target="_blank"
                          rel="noreferrer noopener"
                          css={css`
                            font-size: 0;
                            vertical-align: middle;
                            display: inline-block;
                          `}
                          title="Go to explorer"
                        >
                          <IconButton
                            size={12}
                            as="div"
                            icons={{ default: iconLink }}
                          />
                        </a>
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </Expand>
        </div>
        <Button
          type="submit"
          size="large"
          block
          variant="primary"
          disabled={!fee || !txOptions}
        >
          Claim
        </Button>
        <Button
          size="large"
          block
          variant="secondary"
          onClick={() => handleModalClose()}
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
}

export default ClaimPage;
