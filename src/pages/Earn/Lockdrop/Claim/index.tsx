import Modal from "components/Modal";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import { Col, Row, useScreenClass } from "react-grid-system";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAssets from "hooks/useAssets";
import { useCallback, useMemo } from "react";
import box from "components/Box";
import Typography from "components/Typography";
import { css } from "@emotion/react";
import Expand from "components/Expanded";
import InfoTable from "components/InfoTable";
import useLockdropEvents from "hooks/useLockdropEvents";
import { amountToValue, cutDecimal, formatDecimals, formatNumber } from "utils";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { generateClaimLockdropMsg } from "utils/dezswap";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { CreateTxOptions } from "@xpla/xpla.js";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import useNetwork from "hooks/useNetwork";
import useAPI from "hooks/useAPI";
import Button from "components/Button";
import useRequestPost from "hooks/useRequestPost";

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
  const network = useNetwork();
  const connectedWallet = useConnectedWallet();

  const { getLockdropEventInfo } = useLockdropEvents();
  const api = useAPI();

  const { getAsset } = useAssets();

  const { data: lockdropEventInfo } = useQuery({
    queryKey: ["lockdropEventInfo", eventAddress, network.name],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await getLockdropEventInfo(eventAddress);
      return res;
    },
  });

  const { data: lockdropUserInfo } = useQuery({
    queryKey: ["lockdropUserInfo", eventAddress, network.name],
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

  const lockupInfo = useMemo(() => {
    return lockdropUserInfo?.lockup_infos.find(
      (item) => item.duration === duration,
    );
  }, [duration, lockdropUserInfo]);

  const rewardAsset = useMemo(
    () => getAsset(lockdropEventInfo?.reward_token_addr || ""),
    [getAsset, lockdropEventInfo],
  );

  const txOptions = useMemo<CreateTxOptions | undefined>(() => {
    if (!connectedWallet || !eventAddress || !duration) {
      return undefined;
    }
    return {
      msgs: [
        generateClaimLockdropMsg({
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

  const handleModalClose = () => {
    navigate("../..", { relative: "route" });
  };

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

  return (
    <Modal
      id="claim-modal"
      className="modal-parent"
      isOpen
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
                ]}
              />
            }
          />
        </div>
        <Button
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
