import Modal from "components/Modal";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import { Col, Row, useScreenClass } from "react-grid-system";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAssets from "hooks/useAssets";
import usePairs from "hooks/usePairs";
import { useCallback, useEffect, useMemo } from "react";
import box from "components/Box";
import Typography from "components/Typography";
import { css } from "@emotion/react";
import Expand from "components/Expanded";
import InfoTable from "components/InfoTable";
import Button from "components/Button";
import Message from "components/Message";
import useLockdropEvents from "hooks/useLockdropEvents";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatDateTime,
  formatNumber,
  getTokenLink,
} from "utils";
import { LP_DECIMALS } from "constants/dezswap";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { generateCancelLockdropMsg } from "utils/dezswap";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { AccAddress, CreateTxOptions, Numeric } from "@xpla/xpla.js";
import useRequestPost from "hooks/useRequestPost";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import useNetwork from "hooks/useNetwork";
import useAPI from "hooks/useAPI";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import InputGroup from "../Stake/InputGroup";

const Box = styled(box)`
  & > * {
    margin-bottom: 5px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
`;

function CancelPage() {
  const screenClass = useScreenClass();
  const { eventAddress } = useParams<{ eventAddress?: string }>();
  const [searchParams] = useSearchParams();
  const network = useNetwork();
  const connectedWallet = useConnectedWallet();
  const { getAsset } = useAssets();
  const { findPairByLpAddress } = usePairs();
  const { getLockdropEventInfo } = useLockdropEvents();

  const { data: lockdropEventInfo, error: lockdropEventInfoError } = useQuery({
    queryKey: ["lockdropEventInfo", eventAddress, network.chainID],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await getLockdropEventInfo(eventAddress);
      return res;
    },
  });

  const api = useAPI();
  const navigate = useNavigate();
  const handleModalClose = useCallback(() => {
    navigate("../..", { relative: "route" });
  }, [navigate]);

  const invalidPathModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const { data: lockdropUserInfo } = useQuery({
    queryKey: ["lockdropUserInfo", eventAddress, network.chainID],
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

  const [asset1, asset2] = useMemo(
    () => pair?.asset_addresses.map((address) => getAsset(address)) || [],
    [getAsset, pair],
  );

  const lockupInfo = useMemo(() => {
    return lockdropUserInfo?.lockup_infos.find(
      (item) => item.duration === duration,
    );
  }, [duration, lockdropUserInfo]);

  const rewardAsset = useMemo(
    () =>
      lockdropEventInfo
        ? getAsset(lockdropEventInfo.reward_token_addr)
        : undefined,
    [getAsset, lockdropEventInfo],
  );

  const txOptions = useMemo<CreateTxOptions | undefined>(() => {
    if (!connectedWallet || !eventAddress || !duration) {
      return undefined;
    }
    return {
      msgs: [
        generateCancelLockdropMsg({
          senderAddress: connectedWallet?.walletAddress,
          contractAddress: eventAddress,
          duration,
        }),
      ],
    };
  }, [connectedWallet, duration, eventAddress]);

  const { fee } = useFee(txOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const { requestPost } = useRequestPost(handleModalClose);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (txOptions && fee) {
        requestPost({ txOptions, fee, skipConfirmation: true });
      }
    },
    [fee, requestPost, txOptions],
  );

  useEffect(() => {
    if (
      !AccAddress.validate(eventAddress || "") ||
      (lockdropEventInfo &&
        lockdropEventInfo.event_cancelable_until * 1000 < Date.now()) ||
      lockdropEventInfoError
    ) {
      invalidPathModal.open();
    }
  }, [
    lockdropEventInfo,
    lockdropEventInfoError,
    invalidPathModal,
    eventAddress,
  ]);

  return (
    <Modal
      id="cancel-modal"
      className="modal-parent"
      isOpen
      title="Cancel LP Lock"
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
        <InputGroup
          lpToken={lockdropEventInfo?.lp_token_addr}
          assets={[asset1, asset2]}
          readOnly
          value={amountToValue(lockupInfo?.locked_lp_token || "0", LP_DECIMALS)}
        />

        <Box>
          <Row justify="between" align="start">
            <Col xs="content">
              <Typography color="primary" weight={900} size={14}>
                Locked Until
              </Typography>
            </Col>
            <Col xs="content">
              <Typography color="primary" weight={900} size={14}>
                {formatDateTime(
                  (lockdropEventInfo?.event_end_second || 0) * 1000 +
                    Number(duration) * 7 * 24 * 60 * 60 * 1000,
                )}
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
              {duration}
            </Typography>
            &nbsp;weeks
          </Typography>
        </Box>
        <Box>
          <Row justify="between" align="start">
            <Col xs="content">
              <Typography color="primary" weight={900} size={14}>
                Expected Rewards
                <TooltipWithIcon
                  content="The amount for Expected Rewards may vary due to the composition of the pool changes during the Lock&Drop event period. It will be fixed when the event is over."
                  size={22}
                />
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
              {formatNumber(
                cutDecimal(
                  amountToValue(
                    lockupInfo?.total_reward || "0",
                    rewardAsset?.decimals,
                  ) || 0,
                  DISPLAY_DECIMAL,
                ),
              )}
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
                          network.name,
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
        {lockdropEventInfo?.event_cancelable_until && (
          <Message variant="guide" showIcon={false}>
            You can cancel until&nbsp;
            {formatDateTime(lockdropEventInfo.event_cancelable_until * 1000)}
          </Message>
        )}
        <Button
          type="submit"
          block
          variant="primary"
          size="large"
          disabled={Numeric.parse(lockupInfo?.locked_lp_token || 0).lte(0)}
        >
          Confirm cancellation
        </Button>
        <Button
          block
          variant="secondary"
          size="large"
          onClick={() => handleModalClose()}
          className="cm-hidden"
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
}

export default CancelPage;
