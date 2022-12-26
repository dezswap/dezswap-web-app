import {
  FormEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Typography from "components/Typography";
import { useForm, useWatch } from "react-hook-form";
import useSimulate from "pages/Trade/Swap/useSimulate";
import useAssets from "hooks/useAssets";
import {
  amountToNumber,
  amountToValue,
  cutDecimal,
  formatNumber,
  valueToAmount,
} from "utils";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import { useConnectedWallet } from "@xpla/wallet-provider";
import usePairs from "hooks/usePair";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import { generateSwapMsg } from "utils/dezswap";
import { useBalance } from "hooks/useBalance";
import { useFee } from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import useHashModal from "hooks/useHashModal";
import { css, useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { Col, Row, useScreenClass } from "react-grid-system";
import iconSwap from "assets/icons/icon-from-to.svg";
import iconSwapHover from "assets/icons/icon-from-to-hover.svg";
import iconDefaultAsset from "assets/icons/icon-default-token.svg";
import iconInfo from "assets/icons/icon-info-white.svg";
import { NumberInput } from "components/Input";
import Button from "components/Button";
import Copy from "components/Copy";
import IconButton from "components/IconButton";
import Message from "components/Message";
import Select from "components/Select";
import iconQuestion from "assets/icons/icon-question.svg";
import Expand from "components/Expanded";
import styled from "@emotion/styled";
import SelectAssetForm from "components/SelectAssetForm";
import Box from "components/Box";
import { Colors } from "styles/theme/colors";
import Tooltip from "components/Tooltip";
import Modal from "components/Modal";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import useRequestPost from "hooks/useRequestPost";

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
  return (
    <Modal
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      isOpen={isOpen}
      noPadding
      onGoBack={onGoBack}
    >
      {isOpen && children}
    </Modal>
  );
}

function SwapPage() {
  const navigate = useNavigate();
  const connectedWallet = useConnectedWallet();
  const { value: slippageTolerance } = useSlippageTolerance();
  const { availableAssetAddresses, findPair } = usePairs();
  const { getAsset } = useAssets();
  const [isReversed, setIsReversed] = useState(false);
  const connectWalletModal = useConnectWalletModal();
  const selectAsset1Modal = useHashModal(FormKey.asset1Address);
  const selectAsset2Modal = useHashModal(FormKey.asset2Address);
  const theme = useTheme();
  const { requestPost } = useRequestPost();
  const screenClass = useScreenClass();

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

  const asset1 = useMemo(
    () => getAsset(asset1Address),
    [asset1Address, getAsset],
  );
  const asset2 = useMemo(
    () => getAsset(asset2Address),
    [asset2Address, getAsset],
  );

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
            (Number(simulationResult.spreadAmount) * 100) /
              Number(simulationResult.estimatedAmount),
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

  const createTxOptions = useMemo<CreateTxOptions | undefined>(() => {
    if (
      !simulationResult?.estimatedAmount ||
      simulationResult?.isLoading ||
      !connectedWallet ||
      !selectedPair ||
      !asset1?.address ||
      !Number(asset1Value) ||
      Number.isNaN(Number(asset1Value))
    ) {
      return undefined;
    }
    return {
      msgs: [
        generateSwapMsg(
          connectedWallet.walletAddress,
          selectedPair.contract_addr,
          asset1.address,
          valueToAmount(asset1Value, asset1?.decimals) || "",
          isReversed
            ? valueToAmount(asset2Value, asset2?.decimals) || ""
            : simulationResult.estimatedAmount,
          `${slippageTolerance}`,
        ),
      ],
    };
  }, [
    simulationResult,
    connectedWallet,
    selectedPair,
    asset1,
    asset1Value,
    isReversed,
    asset2Value,
    asset2,
    slippageTolerance,
  ]);

  const {
    fee,
    isLoading: isFeeLoading,
    isFailed: isFeeFailed,
  } = useFee(createTxOptions);

  const feeAmount = useMemo(() => {
    return fee?.amount?.get(XPLA_ADDRESS)?.amount.toString() || "0";
  }, [fee]);

  const asset1BalanceMinusFee = useBalanceMinusFee(
    asset1Address,
    asset1Balance,
    feeAmount,
  );

  const buttonMsg = useMemo(() => {
    if (asset1 === undefined || asset2 === undefined) {
      return "Select tokens";
    }

    if (asset1Value && Number(asset1Value) > 0) {
      if (
        Number(asset1Value) >
        Number(amountToValue(asset1BalanceMinusFee, asset1?.decimals))
      ) {
        return `Insufficient ${asset1?.name} balance`;
      }
      return "Swap";
    }

    return "Enter an amount";
  }, [asset1, asset2, asset1BalanceMinusFee, asset1Value]);

  useEffect(() => {
    if (
      !isReversed &&
      asset1Address === XPLA_ADDRESS &&
      !Number.isNaN(Number(asset1Value)) &&
      Numeric.parse(asset1Value || 0)
        .mul(10 ** (asset1?.decimals || 0))
        .gt(Numeric.parse(asset1BalanceMinusFee || 0))
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
    if (simulationResult?.estimatedAmount) {
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
          txOptions: createTxOptions,
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
  }, [form, fee, asset1Address, asset2Address]);

  return (
    <>
      <SelectAssetDrawer
        isOpen={isSelectAssetOpen}
        onGoBack={() => navigate(-1)}
      >
        <SelectAssetForm
          goBackOnSelect
          addressList={availableAssetAddresses.addresses?.map((address) => ({
            address,
            isLP: false,
          }))}
          hasBackButton
          selectedAssetAddress={
            selectAsset1Modal.isOpen
              ? asset1?.address || ""
              : asset2?.address || ""
          }
          onSelect={(address) => {
            const target = selectAsset1Modal.isOpen
              ? FormKey.asset1Address
              : FormKey.asset2Address;
            const oppositeTarget = selectAsset1Modal.isOpen
              ? FormKey.asset2Address
              : FormKey.asset1Address;
            if (
              formData[oppositeTarget] === address ||
              !findPair([address, formData[oppositeTarget] || ""])
            ) {
              form.setValue(oppositeTarget, "");
            }
            form.setValue(target, address);
          }}
          onGoBack={() => navigate(-1)}
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
            `}
          >
            <Col width="auto">
              <Select
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
                              background-image: url(${asset1?.iconSrc}),
                                url(${iconDefaultAsset});
                              background-position: 50% 50%, 50% 50%;
                              background-size: auto 15px, contain;
                              background-repeat: no-repeat, no-repeat;
                            `}
                          />
                        )}
                        <Typography
                          size={16}
                          weight="bold"
                          color={theme.colors.primary}
                          style={{ paddingLeft: asset1 ? "0px" : "5px" }}
                        >
                          {asset1?.symbol || "Select token"}
                        </Typography>
                      </>
                    ),
                  },
                ]}
              />
            </Col>
            <Col className="cm-hidden">
              <Copy value={asset1Address} />
            </Col>
            <Col
              width="auto"
              css={css`
                opacity: 0.5;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              <Row gutterWidth={0}>
                <Col>
                  <Typography weight="bold">Balance:&nbsp;</Typography>
                </Col>
                <Col>
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
                    {formatNumber(
                      cutDecimal(
                        amountToValue(asset1Balance || 0, asset1?.decimals) ||
                          0,
                        DISPLAY_DECIMAL,
                      ),
                    )}
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
                onFocus={(e) => {
                  e.target.value = asset1Value;
                }}
                {...register(FormKey.asset1Value, {
                  onChange: () => {
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
                    }
                  },
                  required: true,
                  min: {
                    value: Number(amountToValue(1, asset1?.decimals) || 0),
                    message: "",
                  },
                  max: {
                    value: asset1BalanceMinusFee
                      ? amountToNumber(
                          asset1BalanceMinusFee,
                          asset1?.decimals,
                        ) || 0
                      : Infinity,
                    message: "",
                  },
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
                  color={theme.colors.danger}
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
              <Typography color={theme.colors.text.secondary} size={14}>
                -
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
            `}
          >
            <Col width="auto">
              <Select
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
                              background-image: url(${asset2?.iconSrc}),
                                url(${iconDefaultAsset});
                              background-position: 50% 50%, 50% 50%;
                              background-size: auto 15px, contain;
                              background-repeat: no-repeat, no-repeat;
                            `}
                          />
                        )}
                        <Typography
                          size={16}
                          weight="bold"
                          color={theme.colors.primary}
                          style={{ paddingLeft: asset2 ? "0px" : "5px" }}
                        >
                          {asset2?.symbol || "Select token"}
                        </Typography>
                      </>
                    ),
                  },
                ]}
              />
            </Col>
            <Col className="cm-hidden">
              <Copy value={asset2Address} />
            </Col>
            <Col
              width="auto"
              css={css`
                opacity: 0.5;
                text-align: right;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              <Row nogutter>
                <Col>
                  <Typography weight="bold">Balance:&nbsp;</Typography>
                </Col>
                <Col>
                  <Typography
                    weight="bold"
                    color="primary"
                    css={css`
                      cursor: pointer;
                      text-decoration: underline;
                      text-underline-offset: 3px;
                    `}
                  >
                    {formatNumber(
                      cutDecimal(
                        amountToValue(asset2Balance || 0, asset2?.decimals) ||
                          0,
                        DISPLAY_DECIMAL,
                      ),
                    )}
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
                onFocus={(e) => {
                  e.target.value = asset2Value;
                }}
                {...register(FormKey.asset2Value, {
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
                    }
                  },
                  required: true,
                  min: {
                    value: Number(amountToValue(1, asset2?.decimals) || 0),
                    message: "",
                  },
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
                  color={theme.colors.danger}
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
              <Typography color={theme.colors.text.secondary} size={14}>
                -
              </Typography>
            </Col>
          </Row>
        </Box>
        {asset1 && asset2 && (
          <div style={{ marginBottom: "10px" }}>
            <Expand
              label={
                <Typography size={14} weight="bold">
                  {asset1 && `1 ${asset1.symbol} = `}
                  {simulationResult?.estimatedAmount
                    ? cutDecimal(
                        (amountToNumber(
                          simulationResult.estimatedAmount,
                          asset2?.decimals,
                        ) || 0) / Number(asset1Value),
                        DISPLAY_DECIMAL,
                      )
                    : ""}
                  {asset2?.symbol}
                </Typography>
              }
              isExpanded={false}
            >
              <Row
                justify="between"
                style={{ paddingBottom: "3px", alignItems: "center" }}
              >
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    Expected Amount
                  </Typography>
                  <Tooltip
                    arrow
                    placement="right"
                    content="Expected quantity to be received based on the current price, maximum spread and trading fee"
                  >
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Col>
                <Col
                  width="auto"
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    {simulationResult?.estimatedAmount
                      ? formatNumber(
                          amountToValue(
                            simulationResult?.estimatedAmount,
                            asset2?.decimals,
                          ) || 0,
                        )
                      : ""}
                    {asset2?.symbol}
                  </Typography>
                </Col>
              </Row>
              <Row
                justify="between"
                style={{ paddingBottom: "3px", alignItems: "center" }}
              >
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    Price impact
                  </Typography>
                  <Tooltip
                    arrow
                    placement="right"
                    content="Fee paid due to the difference between market price and estimated price"
                  >
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Col>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                  `}
                >
                  <Typography
                    weight="bold"
                    color={spread.color as keyof Colors}
                  >
                    {formatNumber(spread.rate)}%
                  </Typography>
                </Col>
              </Row>
              <Row
                justify="between"
                style={{ paddingBottom: "3px", alignItems: "center" }}
              >
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>Fee</Typography>
                  <Tooltip
                    arrow
                    placement="right"
                    content="Fee paid to execute this transaction"
                  >
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Col>
                <Col
                  width="auto"
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    {feeAmount
                      ? `${formatNumber(
                          amountToValue(feeAmount) || 0,
                        )}${XPLA_SYMBOL}`
                      : ""}
                  </Typography>
                </Col>
              </Row>
              <Row justify="between" style={{ alignItems: "center" }}>
                <Col
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    Route
                  </Typography>
                  <Tooltip
                    arrow
                    placement="right"
                    content="Optimized route for your optimal gain"
                  >
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Col>
                <Col
                  width="auto"
                  css={css`
                    display: flex;
                    justify-content: flex-end;
                  `}
                >
                  <Typography color={theme.colors.text.primary}>
                    {asset1?.symbol} → {asset2?.symbol}
                  </Typography>
                </Col>
              </Row>
            </Expand>
          </div>
        )}
        {spread.message && (
          <Message variant={spread.message}>
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
                Price impact Warning
              </Col>
              <Col
                css={css`
                  text-align: right;
                  display: flex;
                  justify-content: flex-end;
                  align-items: center;
                `}
              >
                {formatNumber(spread.rate)}%
                <Tooltip
                  arrow
                  placement="top"
                  content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris viverra eleifend convallis."
                >
                  <IconButton size={22} icons={{ default: iconInfo }} />
                </Tooltip>
              </Col>
            </Row>
          </Message>
        )}
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
              isFeeFailed
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
            Connect Wallet
          </Button>
        )}
      </Wrapper>
    </>
  );
}

export default SwapPage;
