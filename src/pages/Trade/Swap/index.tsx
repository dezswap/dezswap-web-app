import {
  FormEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Typography from "components/Typography";
import { useForm, useWatch } from "react-hook-form";
import useSimulate from "pages/Trade/Swap/useSimulate";
import useAssets from "hooks/useAssets";
import {
  amountToValue,
  cutDecimal,
  sanitizeNumberInput,
  formatDecimals,
  formatNumber,
  valueToAmount,
} from "utils";
import { Numeric } from "@xpla/xpla.js";
import usePairs from "hooks/usePairs";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import { generateSwapMsg } from "utils/dezswap";
import useBalance from "hooks/useBalance";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import useHashModal from "hooks/useHashModal";
import { css, useTheme } from "@emotion/react";
import { Col, Row, useScreenClass } from "react-grid-system";
import iconSwap from "assets/icons/icon-from-to.svg";
import iconSwapHover from "assets/icons/icon-from-to-hover.svg";
import iconDefaultAsset from "assets/icons/icon-default-token.svg";
import { NumberInput } from "components/Input";
import Button from "components/Button";
import Copy from "components/Copy";
import IconButton from "components/IconButton";
import Message from "components/Message";
import Select from "components/Select";
import iconShift from "assets/icons/icon-shift.svg";
import Expand from "components/Expanded";
import styled from "@emotion/styled";
import SelectAssetForm from "components/SelectAssetForm";
import Box from "components/Box";
import { Colors } from "styles/theme/colors";
import Tooltip from "components/Tooltip";
import Modal from "components/Modal";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import useRequestPost from "hooks/useRequestPost";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import Decimal from "decimal.js";
import usePool from "hooks/usePool";
import useConnectedWallet from "hooks/useConnectedWallet";
import useFirstProvideModal from "hooks/modals/useFirstProvideModal";
import InfoTable from "components/InfoTable";
import useSearchParamState from "hooks/useSearchParamState";
import useDashboardTokenDetail from "hooks/dashboard/useDashboardTokenDetail";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import PercentageFormatter from "components/utils/PercentageFormatter";
import useAPI from "hooks/useAPI";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";

const Wrapper = styled.form`
  width: 100%;
  height: auto;
  position: relative;
`;

enum FormKey {
  asset1Address = "asset1Address",
  asset2Address = "asset2Address",
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

const DISPLAY_DECIMAL = 3;

const MOBILE_DISPLAY_NUMBER_CNT = 20;
const BROWSER_DISPLAY_NUMBER_CNT = 31;

function SelectAssetDrawer({
  isOpen,
  onGoBack,
  children,
}: {
  isOpen: boolean;
  onGoBack?(): void;
  children: ReactNode;
}) {
  const screenClass = useScreenClass();
  const [showChildren, setShowChildren] = useState(false);
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      setShowChildren(true);
    } else {
      timerId = setTimeout(() => {
        setShowChildren(false);
      }, MODAL_CLOSE_TIMEOUT_MS);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isOpen]);
  return (
    <Modal
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      isOpen={isOpen}
      noPadding
      onGoBack={onGoBack}
      onRequestClose={onGoBack}
      style={{
        panel: {
          maxHeight: "unset",
          overflowY: "visible",
        },
      }}
      title="Select a token"
      hasCloseButton={screenClass === MOBILE_SCREEN_CLASS}
      hasGoBackButton={screenClass !== MOBILE_SCREEN_CLASS}
      closeTimeoutMS={
        screenClass !== MOBILE_SCREEN_CLASS ? 0 : MODAL_CLOSE_TIMEOUT_MS
      }
      parentSelector={
        screenClass !== MOBILE_SCREEN_CLASS &&
        document.querySelector(".modal-parent")
          ? () =>
              document.querySelector(".modal-parent") ||
              (document.querySelector("#root") as HTMLElement)
          : undefined
      }
    >
      {showChildren && children}
    </Modal>
  );
}

function SwapPage() {
  const { value: slippageTolerance } = useSlippageTolerance();
  const { value: txDeadlineMinutes } = useTxDeadlineMinutes();
  const { availableAssetAddresses, findPair } = usePairs();
  const { getAsset } = useAssets();
  const [isReversed, setIsReversed] = useState(false);
  const connectWalletModal = useConnectWalletModal();
  const selectAsset1Modal = useHashModal(FormKey.asset1Address);
  const selectAsset2Modal = useHashModal(FormKey.asset2Address);
  const theme = useTheme();
  const { requestPost } = useRequestPost();
  const screenClass = useScreenClass();
  const [balanceApplied, setBalanceApplied] = useState(false);
  const { walletAddress } = useConnectedWallet();
  const isSelectAssetOpen = useMemo(
    () => selectAsset1Modal.isOpen || selectAsset2Modal.isOpen,
    [selectAsset1Modal, selectAsset2Modal],
  );

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = useWatch({ control: form.control });
  const { register, formState } = form;

  const { asset1Address, asset2Address, asset1Value, asset2Value } =
    form.watch();

  const targetRef = useRef<FormKey>();
  const targetValueRef = useRef<FormKey>();
  const firstProvideModal = useFirstProvideModal({
    addresses: [asset1Address, asset2Address],
    onClickCancel: () => {
      if (targetRef.current) {
        form.setValue(targetRef.current, "");
        targetRef.current = undefined;
      }

      if (targetValueRef.current) {
        form.setValue(targetValueRef.current, "");
        targetValueRef.current = undefined;
      }
    },
  });

  const asset1 = useMemo(
    () => getAsset(asset1Address),
    [asset1Address, getAsset],
  );
  const asset2 = useMemo(
    () => getAsset(asset2Address),
    [asset2Address, getAsset],
  );

  const dashboardToken1 = useDashboardTokenDetail(asset1Address);
  const dashboardToken2 = useDashboardTokenDetail(asset2Address);

  const simulationResult = useSimulate({
    fromAddress: asset1Address,
    toAddress: asset2Address,
    isReversed,
    amount: isReversed
      ? valueToAmount(asset2Value, asset2?.decimals)
      : valueToAmount(asset1Value, asset1?.decimals),
  });

  const spread = useMemo<{
    rate: number;
    color: string;
    message?: "error" | "warning";
  }>(() => {
    const percentage = simulationResult
      ? Number(
          cutDecimal(
            new Decimal(simulationResult.spreadAmount || 0)
              .div(
                new Decimal(
                  isReversed
                    ? valueToAmount(asset2Value, asset2?.decimals) || 1
                    : simulationResult.estimatedAmount || 1,
                ),
              )
              .mul(100),
            DISPLAY_DECIMAL,
          ),
        )
      : 0;

    if (percentage >= 0.5) {
      return {
        rate: percentage,
        color: theme.colors.danger,
        message: "error",
      };
    }
    if (percentage >= 0.3) {
      return {
        rate: percentage,
        color: theme.colors.warning,
        message: "warning",
      };
    }
    return {
      rate: percentage,
      color: theme.colors.text.primary,
      message: undefined,
    };
  }, [simulationResult, theme]);

  const asset1Balance = useBalance(asset1Address);
  const asset2Balance = useBalance(asset2Address);

  const selectedPair = useMemo(() => {
    if (!asset1Address || !asset2Address) return null;
    return findPair([asset1Address, asset2Address]);
  }, [asset1Address, asset2Address, findPair]);

  const pool = usePool(selectedPair?.contract_addr);
  const isPoolEmpty = useMemo(
    () =>
      pool?.total_share !== undefined &&
      Numeric.parse(pool.total_share).isZero(),
    [pool?.total_share],
  );

  const beliefPrice = useMemo(() => {
    if (isReversed) {
      if (Number(asset2Value) && simulationResult.estimatedAmount) {
        return Numeric.parse(
          amountToValue(simulationResult.estimatedAmount, asset1?.decimals) ||
            0,
        ).div(asset2Value);
      }
    } else if (Number(asset1Value) && simulationResult.estimatedAmount) {
      return Numeric.parse(asset1Value || 0).div(
        Numeric.parse(
          amountToValue(simulationResult.estimatedAmount, asset2?.decimals) ||
            1,
        ),
      );
    }

    return 0;
  }, [
    isReversed,
    asset1Value,
    asset2Value,
    simulationResult.estimatedAmount,
    asset1?.decimals,
    asset2?.decimals,
  ]);

  const createTxOptions = useMemo(() => {
    if (
      !simulationResult?.estimatedAmount ||
      simulationResult?.isLoading ||
      !walletAddress ||
      !selectedPair ||
      !asset1?.token ||
      !asset1Value ||
      isPoolEmpty ||
      !Number(asset1Value)
    ) {
      return undefined;
    }

    const swapMsg = [
      generateSwapMsg(
        walletAddress,
        selectedPair.contract_addr,
        asset1.token,
        valueToAmount(asset1Value, asset1?.decimals) || "",
        beliefPrice || "",
        `${slippageTolerance}`,
        txDeadlineMinutes ? txDeadlineMinutes * 60 : undefined,
      ),
    ];

    return swapMsg;
  }, [
    simulationResult,
    walletAddress,
    selectedPair,
    asset1,
    asset1Value,
    slippageTolerance,
    beliefPrice,
    txDeadlineMinutes,
    isPoolEmpty,
  ]);

  const {
    fee,
    isLoading: isFeeLoading,
    isFailed: isFeeFailed,
  } = useFee(createTxOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const asset1BalanceMinusFee = useBalanceMinusFee(asset1Address, feeAmount);

  const buttonMsg = useMemo(() => {
    try {
      if (asset1 === undefined || asset2 === undefined) {
        return "Select tokens";
      }

      if (isPoolEmpty) {
        return "Swap";
      }

      if (asset1Value) {
        if (
          Numeric.parse(asset1Value).gt(
            amountToValue(asset1BalanceMinusFee, asset1?.decimals) || 0,
          )
        ) {
          return `Insufficient ${asset1?.symbol} balance`;
        }
        return "Swap";
      }
    } catch (error) {
      console.log(error);
    }
    return "Enter an amount";
  }, [asset1, asset2, asset1BalanceMinusFee, asset1Value, asset2Value]);

  const [shiftAssets, setShiftAssets] = useState(false);

  useEffect(() => {
    if (
      walletAddress &&
      balanceApplied &&
      !isReversed &&
      asset1Address === XPLA_ADDRESS &&
      Number(asset1Value) &&
      Numeric.parse(asset1Value || 0).gt(
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
  }, [asset1BalanceMinusFee, asset1Value, form]);

  useEffect(() => {
    setTimeout(() => {
      form.trigger();
    }, 100);
  }, [asset1Balance, asset2Balance, form]);

  useEffect(() => {
    if (simulationResult) {
      form.setValue(
        simulationResult.isReversed ? FormKey.asset1Value : FormKey.asset2Value,
        amountToValue(
          simulationResult.estimatedAmount,
          isReversed ? asset1?.decimals : asset2?.decimals,
        ) || "",
        { shouldValidate: true },
      );
    }
  }, [asset1, asset2, form, isReversed, simulationResult]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (event.target && createTxOptions && fee) {
        requestPost({
          txOptions: { msgs: createTxOptions },
          fee,
          formElement: event.target as HTMLFormElement,
        });
      }
    },
    [createTxOptions, fee, requestPost],
  );

  useEffect(() => {
    if (asset1Address === XPLA_ADDRESS) {
      form.trigger(FormKey.asset1Value);
    }
  }, [form, asset1Address, asset2Address]);

  const [preselectedAsset2Address, setPreselectedAsset2Address] =
    useSearchParamState("q", undefined, { replace: true });

  useEffect(() => {
    if (preselectedAsset2Address) {
      form.setValue(FormKey.asset2Address, preselectedAsset2Address, {
        shouldValidate: true,
      });
      setPreselectedAsset2Address(undefined);
    }
  }, [form, preselectedAsset2Address, setPreselectedAsset2Address]);

  return (
    <>
      <SelectAssetDrawer
        isOpen={isSelectAssetOpen}
        onGoBack={() => {
          selectAsset1Modal.close();
          selectAsset2Modal.close();
        }}
      >
        <SelectAssetForm
          addressList={availableAssetAddresses}
          selectedAssetAddress={
            selectAsset1Modal.isOpen ? asset1?.token || "" : asset2?.token || ""
          }
          onSelect={(address) => {
            const target = selectAsset1Modal.isOpen
              ? FormKey.asset1Address
              : FormKey.asset2Address;
            const oppositeTarget = selectAsset1Modal.isOpen
              ? FormKey.asset2Address
              : FormKey.asset1Address;

            form.setValue(target, address);
            if (formData[oppositeTarget] === address) {
              const oppositeTargetValue = selectAsset1Modal.isOpen
                ? FormKey.asset2Value
                : FormKey.asset1Value;

              form.setValue(oppositeTarget, "");
              form.setValue(oppositeTargetValue, "");
            } else if (
              formData[oppositeTarget] &&
              !findPair([address, formData[oppositeTarget] || ""])
            ) {
              const targetValue = selectAsset1Modal.isOpen
                ? FormKey.asset1Value
                : FormKey.asset2Value;

              targetRef.current = target;
              targetValueRef.current = targetValue;
              firstProvideModal.open();
            }

            selectAsset1Modal.close();
            selectAsset2Modal.close();
          }}
        />
      </SelectAssetDrawer>
      <Wrapper onSubmit={handleSubmit}>
        <Box
          css={css`
            margin-bottom: 5px;
          `}
        >
          <Row
            gutterWidth={2}
            justify="between"
            align="center"
            css={css`
              margin-bottom: 5px;
              row-gap: 12px;
            `}
          >
            <Col xs={12} sm="content">
              <Row
                gutterWidth={screenClass === MOBILE_SCREEN_CLASS ? 10 : 2}
                justify="between"
                align="center"
                wrap="nowrap"
              >
                <div
                  css={css`
                    position: relative;
                    flex: 1;
                  `}
                >
                  <Select
                    block
                    outline
                    onClick={() => {
                      selectAsset1Modal.open();
                    }}
                    options={[
                      {
                        label: (
                          <>
                            {asset1 && (
                              <div
                                css={css`
                                  display: inline-block;
                                  width: 20px;
                                  height: 20px;
                                  position: relative;
                                  background-image: ${`url(${
                                    asset1?.icon || iconDefaultAsset
                                  })`};
                                  background-position: 50% 50%;
                                  background-size: auto 20px;
                                  background-repeat: no-repeat;
                                  background-color: ${theme.colors.white};
                                  border-radius: 50%;
                                `}
                              />
                            )}
                            <Typography
                              size={16}
                              weight="bold"
                              color="primary"
                              style={{
                                paddingTop: "1px",
                                paddingLeft: asset1 ? "0px" : "5px",
                                lineHeight: 1,
                              }}
                            >
                              {asset1?.symbol || "Select token"}
                            </Typography>
                          </>
                        ),
                      },
                    ]}
                  />
                </div>
                <Col xs="content" className="cm-hidden">
                  <Copy size={38} value={asset1Address} />
                </Col>
              </Row>
            </Col>
            <Col
              xs={12}
              sm="content"
              css={css`
                opacity: 0.5;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              <Row gutterWidth={0} justify="end">
                <Col width="auto">
                  <Typography weight="bold">Balance:&nbsp;</Typography>
                </Col>
                <Col width="auto">
                  <Typography
                    weight="bold"
                    color="primary"
                    css={css`
                      cursor: pointer;
                      text-decoration: underline;
                      text-underline-offset: 3px;
                    `}
                    onClick={() => {
                      setIsReversed(false);
                      setBalanceApplied(true);
                      form.setValue(
                        FormKey.asset1Value,
                        amountToValue(
                          asset1BalanceMinusFee,
                          asset1?.decimals,
                        ) || "",
                        { shouldValidate: true },
                      );
                    }}
                  >
                    <AssetValueFormatter
                      asset={asset1}
                      amount={asset1Balance}
                      showSymbol={false}
                    />
                  </Typography>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row justify="between" align="center">
            <Col>
              <NumberInput
                placeholder="0"
                align="right"
                size="large"
                variant="base"
                decimals={asset1?.decimals}
                onFocus={(e) => {
                  e.target.value = asset1Value;
                }}
                {...register(FormKey.asset1Value, {
                  setValueAs: (value) =>
                    sanitizeNumberInput(value, asset1?.decimals),
                  onChange: () => {
                    setBalanceApplied(false);
                    setIsReversed(false);
                  },
                  onBlur: (e) => {
                    const numberCnt =
                      screenClass === MOBILE_SCREEN_CLASS
                        ? MOBILE_DISPLAY_NUMBER_CNT
                        : BROWSER_DISPLAY_NUMBER_CNT;
                    if (e.target.value.length > numberCnt) {
                      e.target.value = `${e.target.value.slice(
                        0,
                        numberCnt - 2,
                      )}...`;
                    } else {
                      e.target.value = asset1Value;
                    }
                  },
                  required: true,
                })}
                readOnly={isReversed && simulationResult.isLoading}
              />
            </Col>
          </Row>
          <Row justify="between">
            <Col width="auto">
              {formState?.errors?.asset1Value?.message && (
                <Typography
                  size={12}
                  color="danger"
                  css={css`
                    line-height: 18px;
                  `}
                >
                  {formState?.errors?.asset1Value?.message}
                </Typography>
              )}
            </Col>
            <Col
              css={css`
                text-align: right;
              `}
            >
              <Typography color="text.secondary" size={14}>
                {dashboardToken1?.price && Number(asset1Value)
                  ? `= $${formatNumber(
                      formatDecimals(
                        Numeric.parse(dashboardToken1?.price || 0).mul(
                          asset1Value || 0,
                        ),
                        2,
                      ),
                    )}`
                  : "-"}
              </Typography>
            </Col>
          </Row>
        </Box>
        <Row
          align="center"
          justify="center"
          css={css`
            margin: -14px 0;
          `}
        >
          <Col xs="content">
            <IconButton
              size={28}
              icons={{ default: iconSwap, hover: iconSwapHover }}
              onClick={() => {
                const prevData = form.getValues();
                form.setValue(FormKey.asset2Address, prevData.asset1Address);
                form.setValue(FormKey.asset1Address, prevData.asset2Address);
                setIsReversed(false);

                setTimeout(() => {
                  form.trigger();
                }, 100);
              }}
              css={css`
                z-index: 10;
              `}
            />
          </Col>
        </Row>
        <Box
          css={css`
            margin-top: 5px;
            margin-bottom: 10px;
          `}
        >
          <Row
            gutterWidth={2}
            justify="between"
            align="center"
            css={css`
              margin-bottom: 5px;
              row-gap: 12px;
            `}
          >
            <Col xs={12} sm="content">
              <Row
                gutterWidth={screenClass === MOBILE_SCREEN_CLASS ? 10 : 2}
                justify="between"
                align="center"
                wrap="nowrap"
              >
                <div
                  css={css`
                    position: relative;
                    flex: 1;
                  `}
                >
                  <Select
                    block
                    outline
                    onClick={() => {
                      selectAsset2Modal.open();
                    }}
                    options={[
                      {
                        label: (
                          <>
                            {asset2 && (
                              <div
                                css={css`
                                  display: inline-block;
                                  width: 20px;
                                  height: 20px;
                                  position: relative;
                                  background-image: ${`url(${
                                    asset2?.icon || iconDefaultAsset
                                  })`};
                                  background-position: 50% 50%;
                                  background-size: auto 20px;
                                  background-repeat: no-repeat;
                                  background-color: ${theme.colors.white};
                                  border-radius: 50%;
                                `}
                              />
                            )}
                            <Typography
                              size={16}
                              weight="bold"
                              color="primary"
                              style={{
                                paddingTop: "1px",
                                paddingLeft: asset2 ? "0px" : "5px",
                                lineHeight: 1,
                              }}
                            >
                              {asset2?.symbol || "Select token"}
                            </Typography>
                          </>
                        ),
                      },
                    ]}
                  />
                </div>
                <Col xs="content" className="cm-hidden">
                  <Copy size={38} value={asset2Address} />
                </Col>
              </Row>
            </Col>
            <Col
              xs={12}
              sm="content"
              css={css`
                opacity: 0.5;
                text-align: right;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              <Row gutterWidth={0} justify="end">
                <Col width="auto">
                  <Typography weight="bold">Balance:&nbsp;</Typography>
                </Col>
                <Col width="auto">
                  <Typography
                    weight="bold"
                    color="primary"
                    css={css`
                      text-decoration: underline;
                      text-underline-offset: 3px;
                    `}
                  >
                    <AssetValueFormatter
                      asset={asset2}
                      amount={asset2Balance}
                      showSymbol={false}
                    />
                  </Typography>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row justify="between" align="center">
            <Col>
              <NumberInput
                placeholder="0"
                align="right"
                size="large"
                variant="base"
                decimals={asset2?.decimals}
                onFocus={(e) => {
                  e.target.value = asset2Value;
                }}
                {...register(FormKey.asset2Value, {
                  setValueAs: (value) =>
                    sanitizeNumberInput(value, asset2?.decimals),
                  onChange: () => {
                    setIsReversed(true);
                  },
                  onBlur: (e) => {
                    const numberCnt =
                      screenClass === MOBILE_SCREEN_CLASS
                        ? MOBILE_DISPLAY_NUMBER_CNT
                        : BROWSER_DISPLAY_NUMBER_CNT;
                    if (e.target.value.length > numberCnt) {
                      e.target.value = `${e.target.value.slice(
                        0,
                        numberCnt - 2,
                      )}...`;
                    } else {
                      e.target.value = asset2Value;
                    }
                  },
                  required: true,
                })}
                readOnly={!isReversed && simulationResult.isLoading}
              />
            </Col>
          </Row>
          <Row justify="between">
            <Col width="auto">
              {formState?.errors?.asset2Value?.message && (
                <Typography
                  size={12}
                  color="danger"
                  css={css`
                    line-height: 18px;
                  `}
                >
                  {formState?.errors?.asset2Value?.message}
                </Typography>
              )}
            </Col>
            <Col
              css={css`
                text-align: right;
              `}
            >
              <Typography color="text.secondary" size={14}>
                {dashboardToken2?.price && asset2Value
                  ? `= $${formatNumber(
                      formatDecimals(
                        Numeric.parse(dashboardToken2?.price || 0).mul(
                          asset2Value || 0,
                        ),
                        2,
                      ),
                    )}`
                  : "-"}
              </Typography>
            </Col>
          </Row>
        </Box>
        {asset1 && asset2 && (
          <div style={{ marginBottom: "10px" }}>
            <Expand
              label={
                <Typography
                  size={14}
                  weight="bold"
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  {/* // TODO: Refactor */}
                  {shiftAssets ? (
                    <>
                      {`1 ${asset2.symbol}`}
                      <IconButton
                        icons={{ default: iconShift }}
                        size={24}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShiftAssets((current) => !current);
                        }}
                      />
                      {`${
                        asset1Value && asset2Value
                          ? cutDecimal(
                              Numeric.parse(asset1Value || 0).div(
                                asset2Value || 1,
                              ),
                              DISPLAY_DECIMAL,
                            )
                          : "-"
                      } ${asset1?.symbol}`}
                    </>
                  ) : (
                    <>
                      {`1 ${asset1.symbol}`}
                      <IconButton
                        icons={{ default: iconShift }}
                        size={24}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShiftAssets((current) => !current);
                        }}
                      />
                      {`${
                        asset2Value && asset1Value
                          ? cutDecimal(
                              Numeric.parse(asset2Value || 0).div(
                                asset1Value || 1,
                              ),
                              DISPLAY_DECIMAL,
                            )
                          : "-"
                      } ${asset2?.symbol}`}
                    </>
                  )}
                </Typography>
              }
              isExpanded={false}
            >
              <InfoTable
                items={[
                  {
                    key: "expectedAmount",
                    label: `Expected${
                      screenClass === MOBILE_SCREEN_CLASS ? "n" : " "
                    }amount`,
                    tooltip: (
                      <>
                        The result value you may get
                        <br />
                        at the current condition.
                      </>
                    ),
                    value: (
                      <AssetValueFormatter
                        asset={asset2}
                        amount={simulationResult?.estimatedAmount}
                      />
                    ),
                  },
                  {
                    key: "priceImpact",
                    label: "Price impact",
                    tooltip:
                      "The impact on the market price of this pool you may encounter by executing your transaction.",
                    value: (
                      <Typography
                        weight="bold"
                        color={spread.color as keyof Colors}
                      >
                        <PercentageFormatter value={spread.rate} />
                      </Typography>
                    ),
                  },
                  {
                    key: "fee",
                    label: "Fee",
                    tooltip: (
                      <>
                        The fee paid for executing
                        <br />
                        the transaction.
                      </>
                    ),
                    value: (
                      <AssetValueFormatter
                        asset={{ symbol: XPLA_SYMBOL }}
                        amount={feeAmount}
                      />
                    ),
                  },
                  {
                    key: "route",
                    label: "Route",
                    tooltip: `Provide a route for
                    the optimal price.`,
                    value: `${asset1?.symbol} → ${asset2?.symbol}`,
                  },
                ]}
              />
            </Expand>
          </div>
        )}
        {isPoolEmpty && (
          <div>
            <Message variant="guide">
              <Row
                justify="between"
                nogutter
                css={css`
                  width: 100%;
                `}
              >
                <Col
                  css={css`
                    text-align: left;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                  `}
                >
                  Empty pool - {asset1?.symbol}-{asset2?.symbol} is an empty
                  pool, try another one
                </Col>
              </Row>
            </Message>
          </div>
        )}
        {spread.message && (
          <Tooltip
            placement="top"
            content="The impact on the market price of this pool you may encounter by executing your transaction."
          >
            <div>
              <Message variant={spread.message}>
                <Row
                  justify="between"
                  nogutter
                  css={css`
                    width: 100%;
                  `}
                >
                  <Col
                    xs={8}
                    css={css`
                      text-align: left;
                      display: flex;
                      justify-content: flex-start;
                      align-items: center;
                    `}
                  >
                    Price impact warning
                  </Col>
                  <Col
                    xs={4}
                    css={css`
                      text-align: right;
                      display: flex;
                      justify-content: flex-end;
                      align-items: center;
                    `}
                  >
                    <PercentageFormatter value={spread.rate} />
                  </Col>
                </Row>
              </Message>
            </div>
          </Tooltip>
        )}
        {walletAddress ? (
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
              !selectedPair ||
              isPoolEmpty
            }
            css={css`
              margin-top: 20px;
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
              margin-top: 20px;
            `}
            onClick={() => connectWalletModal.open()}
          >
            Connect wallet
          </Button>
        )}
      </Wrapper>
    </>
  );
}

export default SwapPage;
