import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "components/Modal";
import { useNavigate, useParams } from "react-router-dom";
import usePairs from "hooks/usePair";
import useAssets from "hooks/useAssets";
import { useForm } from "react-hook-form";
import { Col, Row, useScreenClass } from "react-grid-system";
import { css } from "@emotion/react";
import iconProvide from "assets/icons/icon-provide.svg";
import Expand from "components/Expanded";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import useSimulate from "pages/Pool/Provide/useSimulate";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  filterNumberFormat,
  formatNumber,
  getAddressLink,
  valueToAmount,
} from "utils";
import styled from "@emotion/styled";
import { LP_DECIMALS } from "constants/dezswap";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import Typography from "components/Typography";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import { useFee } from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { generateAddLiquidityMsg } from "utils/dezswap";
import { NetworkName } from "types/common";
import { useConnectedWallet } from "@xpla/wallet-provider";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import InputGroup from "pages/Pool/Provide/InputGroup";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import useRequestPost from "hooks/useRequestPost";
import { useNetwork } from "hooks/useNetwork";
import iconQuestion from "assets/icons/icon-question.svg";
import Tooltip from "components/Tooltip";

enum FormKey {
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

const Detail = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
`;

const DISPLAY_DECIMAL = 3;

const MOBILE_DISPLAY_NUMBER_CNT = 20;
const BROWSER_DISPLAY_NUMBER_CNT = 31;

function ProvidePage() {
  const connectedWallet = useConnectedWallet();
  const { value: txDeadlineMinutes } = useTxDeadlineMinutes();
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { getPair, pairs } = usePairs();
  const { getAsset } = useAssets();
  const [isReversed, setIsReversed] = useState(false);
  const [balanceApplied, setBalanceApplied] = useState(false);
  const network = useNetwork();
  const pair = useMemo(
    () => (pairAddress ? getPair(pairAddress) : undefined),
    [getPair, pairAddress],
  );
  const [asset1, asset2] = useMemo(
    () => (pair?.asset_addresses || []).map((address) => getAsset(address)),
    [getAsset, pair?.asset_addresses],
  );

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = form.watch();
  const { register, formState } = form;
  const simulationResult = useSimulate(
    pairAddress || "",
    isReversed ? asset2?.address || "" : asset1?.address || "",
    isReversed
      ? valueToAmount(formData.asset2Value, asset2?.decimals) || ""
      : valueToAmount(formData.asset1Value, asset1?.decimals) || "",
  );

  const createTxOptions = useMemo<CreateTxOptions | undefined>(
    () =>
      simulationResult?.estimatedAmount &&
      !simulationResult?.isLoading &&
      connectedWallet &&
      asset1?.address &&
      formData.asset1Value &&
      asset2?.address &&
      formData.asset2Value &&
      !Numeric.parse(formData.asset1Value).isNaN() &&
      !Numeric.parse(formData.asset2Value).isNaN()
        ? {
            msgs: generateAddLiquidityMsg(
              connectedWallet?.network.name as NetworkName,
              connectedWallet.walletAddress,
              pairAddress || "",
              [
                {
                  address: asset1?.address || "",
                  amount:
                    valueToAmount(formData.asset1Value, asset1?.decimals) ||
                    "0",
                },
                {
                  address: asset2?.address || "",
                  amount:
                    valueToAmount(formData.asset2Value, asset2?.decimals) ||
                    "0",
                },
              ],
              txDeadlineMinutes ? txDeadlineMinutes * 60 : undefined,
            ),
          }
        : undefined,
    [
      simulationResult,
      connectedWallet,
      asset1,
      isReversed,
      asset2,
      formData.asset1Value,
      formData.asset2Value,
    ],
  );

  const {
    fee,
    isLoading: isFeeLoading,
    isFailed: isFeeFailed,
  } = useFee(createTxOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const asset1BalanceMinusFee = useBalanceMinusFee(
    asset1?.address,
    asset1?.balance,
    feeAmount,
  );

  const asset2BalanceMinusFee = useBalanceMinusFee(
    asset2?.address,
    asset2?.balance,
    feeAmount,
  );

  const buttonMsg = useMemo(() => {
    if (formData.asset1Value) {
      if (
        Numeric.parse(formData.asset1Value).gt(
          Numeric.parse(
            amountToValue(asset1BalanceMinusFee, asset1?.decimals) || 0,
          ),
        )
      ) {
        return `Insufficient ${asset1?.symbol} balance`;
      }

      if (
        formData.asset2Value &&
        Numeric.parse(formData.asset2Value).gt(
          Numeric.parse(
            amountToValue(asset2BalanceMinusFee, asset2?.decimals) || 0,
          ),
        )
      ) {
        return `Insufficient ${asset2?.symbol} balance`;
      }

      if (formData.asset1Value && !formData.asset2Value) {
        return `Insufficient ${asset2?.symbol} in the pool`;
      }
      return "Add liquidity";
    }

    if (formData.asset2Value && !formData.asset1Value) {
      return `Insufficient ${asset2?.symbol} in the pool`;
    }

    return "Enter an amount";
  }, [
    asset1,
    asset2,
    asset1BalanceMinusFee,
    formData.asset1Value,
    formData.asset2Value,
  ]);

  const handleModalClose = useCallback(() => {
    navigate("/pool", { replace: true });
  }, [navigate]);

  const { requestPost } = useRequestPost(handleModalClose, true);

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

  useEffect(() => {
    if (
      connectedWallet &&
      balanceApplied &&
      !isReversed &&
      asset1?.address === XPLA_ADDRESS &&
      formData.asset1Value &&
      Numeric.parse(formData.asset1Value || 0).gt(
        Numeric.parse(
          amountToValue(asset1BalanceMinusFee, asset1?.decimals) || 0,
        ),
      )
    ) {
      form.setValue(
        FormKey.asset1Value,
        amountToValue(asset1BalanceMinusFee, asset1?.decimals) || "",
        {
          shouldValidate: true,
        },
      );
    }
  }, [asset1BalanceMinusFee, formData.asset1Value, form]);

  useEffect(() => {
    if (
      connectedWallet &&
      balanceApplied &&
      isReversed &&
      asset2?.address === XPLA_ADDRESS &&
      formData.asset2Value &&
      Numeric.parse(formData.asset2Value || 0).gt(
        Numeric.parse(
          amountToValue(asset1BalanceMinusFee, asset2?.decimals) || 0,
        ),
      )
    ) {
      form.setValue(
        FormKey.asset2Value,
        amountToValue(asset2BalanceMinusFee, asset2?.decimals) || "",
        {
          shouldValidate: true,
        },
      );
    }
  }, [asset2BalanceMinusFee, formData.asset2Value, form]);

  useEffect(() => {
    if (simulationResult && !simulationResult.isLoading) {
      form.setValue(
        isReversed ? FormKey.asset1Value : FormKey.asset2Value,
        amountToValue(
          simulationResult.estimatedAmount,
          isReversed ? asset1?.decimals : asset2?.decimals,
        ) || "",
        { shouldValidate: true },
      );
    }
  }, [simulationResult]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (pairs?.length && !pair) {
        handleModalClose();
      }
    }, 500); // wait for 500ms to make sure the pair is loaded
    return () => {
      clearTimeout(timerId);
    };
  }, [handleModalClose, pair, pairs?.length]);

  return (
    <Modal
      isOpen
      title="Add liquidity"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={() => handleModalClose()}
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          {...register(FormKey.asset1Value, {
            setValueAs: (value) => filterNumberFormat(value, asset1?.decimals),
            required: true,
          })}
          asset={asset1}
          onClick={() => {
            setIsReversed(false);
            setBalanceApplied(false);
          }}
          onBalanceClick={(value) => {
            setIsReversed(false);
            setBalanceApplied(true);
            form.setValue(FormKey.asset1Value, value, {
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
              e.target.value = formData.asset1Value;
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
            background-image: url(${iconProvide});
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: contain;
            z-index: 1;
          `}
        />
        <InputGroup
          {...register(FormKey.asset2Value, {
            setValueAs: (value) => filterNumberFormat(value, asset2?.decimals),
            required: true,
          })}
          asset={asset2}
          onClick={() => {
            setIsReversed(true);
            setBalanceApplied(false);
          }}
          onBalanceClick={(value) => {
            setIsReversed(true);
            setBalanceApplied(true);
            form.setValue(FormKey.asset2Value, value, {
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
              e.target.value = formData.asset2Value;
            }
          }}
          style={{ marginBottom: 10 }}
        />
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <Expand
            label={
              <Typography weight="bold">
                {`1${asset1?.symbol} = ${
                  formData.asset1Value && formData.asset2Value
                    ? cutDecimal(
                        Numeric.parse(formData.asset2Value || 0)
                          .div(formData.asset1Value || 1)
                          .toString(),
                        DISPLAY_DECIMAL,
                      )
                    : "-"
                }${asset2?.symbol}`}
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
                    LP supply
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
                    {`${formatNumber(
                      cutDecimal(
                        amountToValue(simulationResult?.share, LP_DECIMALS) ||
                          0,
                        DISPLAY_DECIMAL,
                      ),
                    )} LP` || "-"}
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
                    Pool liquidity{asset1 && ` (${asset1?.symbol})`}
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
                    {formatNumber(formData.asset1Value) || "-"}
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
                    Pool liquidity{asset2 && ` (${asset2?.symbol})`}
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
                    {formatNumber(formData.asset2Value) || "-"}
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
                    xs={7}
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      text-align: right;
                      word-break: break-word;
                      align-items: center;
                    `}
                  >
                    {formatNumber(
                      cutDecimal(
                        simulationResult?.percentageOfShare || 0,
                        DISPLAY_DECIMAL,
                      ),
                    ) || "-"}
                    %
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
                    xs={7}
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      text-align: right;
                      word-break: break-word;
                      align-items: center;
                    `}
                  >
                    {feeAmount
                      ? `${formatNumber(
                          amountToValue(feeAmount) || 0,
                        )}${XPLA_SYMBOL}`
                      : ""}
                  </Col>
                </Row>
              </Detail>
            }
          >
            <Detail>
              <Row
                justify="between"
                style={{ paddingTop: "3px", paddingBottom: "3px" }}
              >
                <Col width="content">LP Address</Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                    text-align: right;
                    word-break: break-word;
                    align-items: center;
                  `}
                >
                  {ellipsisCenter(pair?.liquidity_token)}&nbsp;
                  <a
                    href={getAddressLink(pair?.liquidity_token, network.name)}
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
              <Row justify="between" style={{ paddingBottom: "3px" }}>
                <Col width="content">
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
              <Row justify="between">
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
            isFeeFailed
          }
          css={css`
            margin-bottom: 10px;
          `}
        >
          {buttonMsg}
        </Button>
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

export default ProvidePage;
