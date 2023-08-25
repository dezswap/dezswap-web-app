import Modal from "components/Modal";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import { Col, Row, useScreenClass } from "react-grid-system";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAssets from "hooks/useAssets";
import usePairs from "hooks/usePairs";
import { useCallback, useEffect, useMemo } from "react";
import box from "components/Box";
import Typography from "components/Typography";
import Slider from "components/Slider";
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
  filterNumberFormat,
  formatDateTime,
  formatDecimals,
  formatNumber,
  valueToAmount,
} from "utils";
import { Controller, useForm } from "react-hook-form";
import { LP_DECIMALS } from "constants/dezswap";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import useSimulate from "pages/Earn/Pools/Withdraw/useSimulate";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { generateIncreaseLockupContractMsg } from "utils/dezswap";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import useRequestPost from "hooks/useRequestPost";
import useBalance from "hooks/useBalance";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import useNetwork from "hooks/useNetwork";
import InputGroup from "./InputGroup";
import useExpectedReward from "./useEstimatedReward";

enum FormKey {
  lpValue = "lpValue",
  duration = "duration",
}

const Box = styled(box)`
  & > * {
    margin-bottom: 5px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
`;

function StakePage() {
  const { eventAddress } = useParams<{ eventAddress?: string }>();
  const [searchParams] = useSearchParams();
  const network = useNetwork();
  const connectedWallet = useConnectedWallet();
  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
    defaultValues: {
      lpValue: "",
      duration: "8",
    },
  });

  const { getAsset } = useAssets();
  const { findPairByLpAddress } = usePairs();
  const { getLockdropEventInfo } = useLockdropEvents();

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

  const lpValue = form.watch(FormKey.lpValue);
  const duration = form.watch(FormKey.duration);
  const lpBalance = useBalance(lockdropEventInfo?.lp_token_addr);

  const { register, formState } = form;

  const screenClass = useScreenClass();
  const navigate = useNavigate();
  const handleModalClose = () => {
    navigate(-1);
  };

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

  const rewardAsset = useMemo(
    () =>
      lockdropEventInfo
        ? getAsset(lockdropEventInfo.reward_token_addr)
        : undefined,
    [getAsset, lockdropEventInfo],
  );

  const simulationResult = useSimulate(
    pair?.contract_addr || "",
    pair?.liquidity_token || "",
    valueToAmount(lpValue, LP_DECIMALS) || "0",
  );

  const { expectedReward } = useExpectedReward({
    lockdropEventAddress: eventAddress,
    amount: valueToAmount(lpValue, LP_DECIMALS) || "0",
    duration: Number(duration),
  });

  const estimatedLockingAmounts = useMemo(() => {
    return [asset1, asset2].map(
      (asset) =>
        `${formatNumber(
          formatDecimals(
            amountToValue(
              simulationResult?.estimatedAmount?.find(
                (a) => a.address === asset?.token,
              )?.amount,
              asset?.decimals,
            ) || "0",
            3,
          ),
        )} ${asset?.symbol}`,
    );
  }, [asset1, asset2, simulationResult]);

  useEffect(() => {
    const defaultDuration = searchParams.get("duration");
    if (defaultDuration) {
      form.setValue(FormKey.duration, defaultDuration);
    }
  }, [form, searchParams]);

  const txOptions = useMemo<CreateTxOptions | undefined>(() => {
    if (
      !connectedWallet?.walletAddress ||
      !eventAddress ||
      !lockdropEventInfo?.lp_token_addr
    ) {
      return undefined;
    }
    return {
      msgs: [
        generateIncreaseLockupContractMsg({
          senderAddress: connectedWallet?.walletAddress,
          contractAddress: eventAddress,
          lpTokenAddress: lockdropEventInfo?.lp_token_addr,
          amount: valueToAmount(lpValue, LP_DECIMALS),
          duration: Number(duration),
        }),
      ],
    };
  }, [connectedWallet, duration, eventAddress, lockdropEventInfo, lpValue]);

  const { fee } = useFee(txOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const buttonMsg = useMemo(() => {
    if (lpValue && Numeric.parse(lpValue).gt(0)) {
      if (
        Numeric.parse(valueToAmount(lpValue, LP_DECIMALS) || 0).gt(
          lpBalance || 0,
        )
      ) {
        return "Insufficient LP balance";
      }

      return "Lock";
    }

    return "Enter an amount";
  }, [lpBalance, lpValue]);

  const isValid = buttonMsg === "Lock";

  const { requestPost } = useRequestPost(handleModalClose);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      if (txOptions && fee) {
        requestPost({ txOptions, fee, formElement: event.currentTarget });
      }
    },
    [fee, requestPost, txOptions],
  );

  return (
    <Modal
      id="stake-modal"
      className="modal-parent"
      isOpen
      title={searchParams.get("duration") ? "Lock more LP" : "LP Lock&Drop"}
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
          onBalanceClick={(value) => {
            form.setValue(FormKey.lpValue, value);
          }}
          {...register(FormKey.lpValue, {
            setValueAs: (value) => filterNumberFormat(value, LP_DECIMALS),
            required: true,
          })}
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

          <div className="cm-hidden">
            <div
              css={css`
                margin-bottom: 8px;
              `}
            >
              <Controller
                name={FormKey.duration}
                control={form.control}
                render={({ field }) => (
                  <Slider
                    min={lockdropEventInfo?.min_lock_duration || 4}
                    max={lockdropEventInfo?.max_lock_duration || 52}
                    step={1}
                    onBlur={field.onBlur}
                    onChange={(value) => field.onChange(`${value}`)}
                    value={Number(field.value)}
                  />
                )}
              />
            </div>

            <div
              css={css`
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 4px;
              `}
            >
              <Typography size={14} weight={700}>
                {lockdropEventInfo?.min_lock_duration || 4} WK
              </Typography>

              <Typography size={14} weight={700}>
                {lockdropEventInfo?.max_lock_duration || 52} WK
              </Typography>
            </div>
          </div>
        </Box>
        <Box>
          <Row justify="between" align="start">
            <Col xs="content">
              {/* TODO: add tooltip */}
              <Typography color="primary" weight={900} size={14}>
                Expected Rewards
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
              {formatNumber(
                cutDecimal(
                  amountToValue(expectedReward, rewardAsset?.decimals) || 0,
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
                  key: "estimatedTokens",
                  label: "Estimated Tokens",
                  value: (
                    <>
                      {estimatedLockingAmounts.map((string) => (
                        <>
                          {string}
                          <br />
                        </>
                      ))}
                    </>
                  ),
                  tooltip: "Lorem ipsum", // TODO: add tooltip
                },
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
                  value: ellipsisCenter(lockdropEventInfo?.lp_token_addr, 6),
                },
                {
                  key: "asset1Address",
                  label: `${asset1?.name || ""} Address`,
                  value: ellipsisCenter(asset1?.token || "", 6),
                },
                {
                  key: "asset2Address",
                  label: `${asset2?.name || ""} Address`,
                  value: ellipsisCenter(asset2?.token || "", 6),
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
          disabled={!isValid}
        >
          {buttonMsg}
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

export default StakePage;
