import { FormEventHandler, useCallback, useMemo, useState } from "react";
import Typography from "components/Typography";
import {
  BROWSER_DISPLAY_NUMBER_CNT,
  DISPLAY_DECIMAL,
  MOBILE_DISPLAY_NUMBER_CNT,
  MOBILE_SCREEN_CLASS,
} from "constants/layout";
import InputGroup from "pages/Pool/Withdraw/InputGroup";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  filterNumberFormat,
  formatNumber,
  getAddressLink,
  valueToAmount,
} from "utils";
import iconWithdraw from "assets/icons/icon-withdraw.svg";
import Expand from "components/Expanded";
import { Col, Row, useScreenClass } from "react-grid-system";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import Button from "components/Button";
import Modal from "components/Modal";
import styled from "@emotion/styled";
import { useNavigate, useParams } from "react-router-dom";
import useSimulate from "pages/Pool/Withdraw/useSimulate";
import usePairs from "hooks/usePair";
import { useNetwork } from "hooks/useNetwork";
import { useForm } from "react-hook-form";
import useAssets from "hooks/useAssets";
import { css, useTheme } from "@emotion/react";
import Box from "components/Box";
import Hr from "components/Hr";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import { useConnectedWallet } from "@xpla/wallet-provider";
import useRequestPost from "hooks/useRequestPost";
import { useFee } from "hooks/useFee";
import { generateWithdrawLiquidityMsg } from "utils/dezswap";
import { NetworkName } from "types/common";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { LP_DECIMALS } from "constants/dezswap";
import iconQuestion from "assets/icons/icon-question.svg";
import Tooltip from "components/Tooltip";
import { useBalance } from "hooks/useBalance";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";

const Detail = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
`;

enum FormKey {
  lpValue = "lpValue",
}

function WithdrawPage() {
  const connectedWallet = useConnectedWallet();
  const connectWalletModal = useConnectWalletModal();
  const { value: txDeadlineMinutes } = useTxDeadlineMinutes();
  const theme = useTheme();
  const screenClass = useScreenClass();
  const navigate = useNavigate();
  const network = useNetwork();
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const { getPair } = usePairs();
  const pair = useMemo(
    () => (pairAddress ? getPair(pairAddress) : undefined),
    [getPair, pairAddress],
  );
  const { getAsset } = useAssets();
  const [asset1, asset2] = pair
    ? pair.asset_addresses
        .map((address) => getAsset(address))
        .map((a) => ({
          address: a?.address,
          symbol: a?.symbol,
          decimals: a?.decimals,
          iconSrc: a?.iconSrc,
        }))
    : [undefined, undefined];

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const { register, formState } = form;

  const { lpValue } = form.watch();

  const simulationResult = useSimulate(
    pairAddress || "",
    pair?.liquidity_token || "",
    valueToAmount(lpValue, LP_DECIMALS) || "0",
  );

  const handleModalClose = useCallback(() => {
    navigate("/pool", { replace: true });
  }, [navigate]);

  const { requestPost } = useRequestPost(handleModalClose, true);

  const balance = useBalance(pair?.liquidity_token || "");

  const isLpPayable = useMemo(
    () =>
      lpValue &&
      Numeric.parse(
        valueToAmount(lpValue, LP_DECIMALS) || "0",
      ).lessThanOrEqualTo(balance || "0"),
    [lpValue, balance],
  );

  const createTxOptions = useMemo<CreateTxOptions | undefined>(
    () =>
      !simulationResult?.isLoading &&
      !simulationResult?.isFailed &&
      connectedWallet &&
      isLpPayable
        ? {
            msgs: [
              generateWithdrawLiquidityMsg(
                connectedWallet?.network.name as NetworkName,
                connectedWallet?.walletAddress || "",
                pairAddress || "",
                pair?.liquidity_token || "",
                valueToAmount(lpValue, LP_DECIMALS) || "0",
                // [
                //   {
                //     address: asset1?.address || "",
                //     amount:
                //       simulationResult?.estimatedAmount?.find(
                //         (a) => a.address === asset1?.address,
                //       )?.amount || "0",
                //   },
                //   {
                //     address: asset2?.address || "",
                //     amount:
                //       simulationResult?.estimatedAmount?.find(
                //         (a) => a.address === asset2?.address,
                //       )?.amount || "0",
                //   },
                // ],
                txDeadlineMinutes ? txDeadlineMinutes * 60 : undefined,
              ),
            ],
          }
        : undefined,
    [connectedWallet, simulationResult, lpValue],
  );

  const {
    fee,
    isLoading: isFeeLoading,
    isFailed: isFeeFailed,
  } = useFee(createTxOptions);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (event.target && createTxOptions && fee) {
        requestPost({
          txOptions: createTxOptions,
          fee,
          formElement: event.target as HTMLFormElement,
        });
      }
    },
    [createTxOptions, fee, requestPost],
  );

  const buttonMsg = useMemo(() => {
    if (lpValue) {
      if (!isLpPayable) {
        return "Insufficient LP balance";
      }

      return "Remove liquidity";
    }

    return "Enter an amount";
  }, [lpValue, isLpPayable]);

  return (
    <Modal
      id="withdraw-modal"
      isOpen
      title="Remove liquidity"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={() => handleModalClose()}
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          {...register(FormKey.lpValue, {
            setValueAs: (value) => filterNumberFormat(value, asset1?.decimals),
            required: true,
          })}
          lpToken={pair?.liquidity_token}
          assets={
            pair?.asset_addresses.map((address) => getAsset(address)) || []
          }
          onBalanceClick={(value) => {
            form.setValue(FormKey.lpValue, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
          onBlur={(e) => {
            const numberCnt =
              screenClass === MOBILE_SCREEN_CLASS
                ? MOBILE_DISPLAY_NUMBER_CNT
                : BROWSER_DISPLAY_NUMBER_CNT;
            if (e.target.value.length > numberCnt) {
              e.target.value = `${e.target.value.slice(0, numberCnt - 2)}...`;
            } else {
              e.target.value = lpValue;
            }
          }}
        />
        <div
          css={css`
            position: relative;
            width: 100%;
            height: 28px;
            margin-top: -9px;
            margin-bottom: -9px;
            background-image: url(${iconWithdraw});
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: contain;
            z-index: 1;
          `}
        />
        <Box
          css={css`
            border: solid 3px ${theme.colors.primary};
            margin-bottom: 10px;
            background-color: ${theme.colors.selected};
          `}
        >
          <Row justify="between" align="center" style={{ gap: 3 }}>
            <Col xs={12} sm="content">
              <Row gutterWidth={4} justify="start" align="center" wrap="nowrap">
                <Col
                  xs="content"
                  style={screenClass === "xs" ? { flex: 1 } : {}}
                >
                  <Button
                    block={screenClass === "xs"}
                    css={css`
                      pointer-events: none;
                      border-radius: 30px;
                      height: 38px;
                      padding: 0 9px;
                      justify-content: flex-start;
                      background-color: ${theme.colors.white};
                    `}
                  >
                    <IconButton
                      size={24}
                      icons={{
                        default: asset1?.iconSrc || iconDefaultToken,
                      }}
                      css={css`
                        margin-right: 4px;
                      `}
                    />
                    {asset1?.symbol}
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col
              xs={12}
              style={{
                display: "flex",
                flexGrow: 1,
                flexBasis: 0,
                justifyContent: "flex-end",
              }}
            >
              <Typography
                weight={900}
                size={22}
                css={css`
                  line-height: 38px;
                  text-align: right;
                  cursor: pointer;
                `}
              >
                {formatNumber(
                  amountToValue(
                    simulationResult?.estimatedAmount?.find(
                      (a) => a.address === asset1?.address,
                    )?.amount,
                    asset1?.decimals,
                  ) || "0",
                )}
              </Typography>
            </Col>
          </Row>
          <Row style={{ paddingBottom: "16px" }}>
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
          <Hr />
          <Row
            justify="between"
            align="center"
            style={{ gap: 3, paddingTop: "16px" }}
          >
            <Col xs={12} sm="content">
              <Row gutterWidth={4} justify="start" align="center" wrap="nowrap">
                <Col
                  xs="content"
                  style={screenClass === "xs" ? { flex: 1 } : {}}
                >
                  <Button
                    block={screenClass === "xs"}
                    css={css`
                      pointer-events: none;
                      border-radius: 30px;
                      height: 38px;
                      padding: 0 9px;
                      justify-content: flex-start;
                      background-color: ${theme.colors.white};
                    `}
                  >
                    <IconButton
                      size={24}
                      icons={{
                        default: asset2?.iconSrc || iconDefaultToken,
                      }}
                      css={css`
                        margin-right: 4px;
                      `}
                    />
                    {asset2?.symbol}
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col
              xs={12}
              style={{
                display: "flex",
                flexGrow: 1,
                flexBasis: 0,
                justifyContent: "flex-end",
              }}
            >
              <Typography
                weight={900}
                size={22}
                css={css`
                  line-height: 38px;
                  text-align: right;
                  cursor: pointer;
                `}
              >
                {formatNumber(
                  amountToValue(
                    simulationResult?.estimatedAmount?.find(
                      (a) => a.address === asset2?.address,
                    )?.amount,
                    asset2?.decimals,
                  ) || "0",
                )}
              </Typography>
            </Col>
          </Row>
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
            margin-bottom: 20px;
          `}
        >
          <Expand
            label={
              <Typography weight="bold">
                {`${asset1?.symbol} - ${asset2?.symbol}`}
              </Typography>
            }
            preview={
              <Detail>
                <Row
                  justify="between"
                  style={{ paddingBottom: "3px", alignItems: "flex-start" }}
                >
                  <Col
                    width="content"
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    Expected amount
                    <Tooltip
                      arrow
                      placement={
                        screenClass === MOBILE_SCREEN_CLASS ? "top" : "right"
                      }
                      content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    >
                      <IconButton
                        className="cm-hidden"
                        size={22}
                        icons={{ default: iconQuestion }}
                      />
                    </Tooltip>
                  </Col>
                  <Col
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      text-align: right;
                      word-break: break-word;
                    `}
                  >
                    {formatNumber(
                      amountToValue(
                        simulationResult?.estimatedAmount?.find(
                          (a) => a.address === asset1?.address,
                        )?.amount,
                        asset1?.decimals,
                      ) || "",
                    )}
                    &nbsp;
                    {asset1?.symbol}
                  </Col>
                </Row>
                <Row justify="between" style={{ alignItems: "flex-start" }}>
                  <Col width="content" />
                  <Col
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      text-align: right;
                      word-break: break-word;
                    `}
                  >
                    {formatNumber(
                      amountToValue(
                        simulationResult?.estimatedAmount?.find(
                          (a) => a.address === asset2?.address,
                        )?.amount,
                        asset1?.decimals,
                      ) || "",
                    )}
                    &nbsp;{asset2?.symbol}
                  </Col>
                </Row>
                <Row justify="between" style={{ alignItems: "flex-start" }}>
                  <Col
                    width="content"
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    Fee
                    <Tooltip
                      arrow
                      placement={
                        screenClass === MOBILE_SCREEN_CLASS ? "top" : "right"
                      }
                      content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    >
                      <IconButton
                        className="cm-hidden"
                        size={22}
                        icons={{ default: iconQuestion }}
                      />
                    </Tooltip>
                  </Col>
                  <Col
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      text-align: right;
                      word-break: break-word;
                    `}
                  >
                    {fee
                      ? formatNumber(
                          cutDecimal(
                            amountToValue(
                              fee.amount?.get(XPLA_ADDRESS)?.amount.toString(),
                            ) || 0,
                            DISPLAY_DECIMAL,
                          ),
                        )
                      : "-"}
                    &nbsp;{XPLA_SYMBOL}
                  </Col>
                </Row>
              </Detail>
            }
          >
            <Detail>
              <Row
                justify="between"
                style={{
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  alignItems: "flex-start",
                }}
              >
                <Col
                  width="content"
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  LP
                  <Tooltip
                    arrow
                    placement={
                      screenClass === MOBILE_SCREEN_CLASS ? "top" : "right"
                    }
                    content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  >
                    <IconButton
                      className="cm-hidden"
                      size={22}
                      icons={{ default: iconQuestion }}
                    />
                  </Tooltip>
                </Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    text-align: right;
                    word-break: break-word;
                    align-items: center;
                  `}
                >
                  {formatNumber(lpValue)}
                </Col>
              </Row>
              <Row
                justify="between"
                style={{ paddingBottom: "3px", alignItems: "flex-start" }}
              >
                <Col
                  width="content"
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  Your share
                  <Tooltip
                    arrow
                    placement={
                      screenClass === MOBILE_SCREEN_CLASS ? "top" : "right"
                    }
                    content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  >
                    <IconButton
                      className="cm-hidden"
                      size={22}
                      icons={{ default: iconQuestion }}
                    />
                  </Tooltip>
                </Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    text-align: right;
                    word-break: break-word;
                    align-items: center;
                  `}
                >
                  {formatNumber(simulationResult.percentageOfShare || "0")}%
                </Col>
              </Row>
              <Row justify="between" style={{ alignItems: "flex-start" }}>
                <Col width="content" style={{ paddingBottom: "3px" }}>
                  {asset1 && `${asset1?.symbol} `}Address
                </Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    text-align: right;
                    word-break: break-word;
                    align-items: center;
                  `}
                >
                  {ellipsisCenter(asset1?.address)}&nbsp;
                  <a
                    href={getAddressLink(asset1?.address, network.name)}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton size={12.2} icons={{ default: iconLink }} />
                  </a>
                </Col>
              </Row>
              <Row justify="between" style={{ alignItems: "flex-start" }}>
                <Col width="content">
                  {asset2 && `${asset2?.symbol} `}Address
                </Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    text-align: right;
                    word-break: break-word;
                    align-items: center;
                  `}
                >
                  {ellipsisCenter(asset2?.address)}&nbsp;
                  <a
                    href={getAddressLink(asset2?.address, network.name)}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton size={12.2} icons={{ default: iconLink }} />
                  </a>
                </Col>
              </Row>
            </Detail>
          </Expand>
        </div>
        {connectedWallet ? (
          <Button
            type="submit"
            size="large"
            variant="primary"
            block
            disabled={
              !form.formState.isValid ||
              form.formState.isValidating ||
              simulationResult.isLoading ||
              isFeeLoading ||
              isFeeFailed ||
              !isLpPayable
            }
            css={css`
              margin-bottom: 10px;
            `}
          >
            {buttonMsg}
          </Button>
        ) : (
          <Button
            size="large"
            variant="primary"
            block
            css={css`
              margin-bottom: 10px;
            `}
            onClick={() => connectWalletModal.open()}
          >
            Connect wallet
          </Button>
        )}
        <Button
          type="button"
          size="large"
          variant="secondary"
          block
          onClick={handleModalClose}
          className="cm-hidden"
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
}

export default WithdrawPage;
