import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "components/Modal";
import { useNavigate, useParams } from "react-router-dom";
import usePairs from "hooks/usePairs";
import useAssets from "hooks/useAssets";
import { useForm } from "react-hook-form";
import { Col, Row, useScreenClass } from "react-grid-system";
import { css } from "@emotion/react";
import iconProvide from "assets/icons/icon-provide.svg";
import Expand from "components/Expanded";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import useSimulate from "pages/Earn/Pools/Provide/useSimulate";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatNumber,
  formatRatio,
  getTokenLink,
  valueToAmount,
} from "utils";
import { LOCKED_LP_SUPPLY, LP_DECIMALS } from "constants/dezswap";
import { AccAddress, CreateTxOptions, Numeric } from "@xpla/xpla.js";
import Typography from "components/Typography";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { generateAddLiquidityMsg } from "utils/dezswap";
import { NetworkName } from "types/common";
import { useConnectedWallet } from "@xpla/wallet-provider";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import InputGroup from "pages/Earn/Pools/Provide/InputGroup";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import useRequestPost from "hooks/useRequestPost";
import useNetwork from "hooks/useNetwork";
import usePool from "hooks/usePool";
import Message from "components/Message";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import InfoTable from "components/InfoTable";
import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";
import useSettingsModal from "hooks/modals/useSettingsModal";
import ProgressBar from "components/ProgressBar";
import Box from "components/Box";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import useSlippageTolerance from "hooks/useSlippageTolerance";

export enum FormKey {
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

const DISPLAY_DECIMAL = 3;

function ProvidePage() {
  const connectedWallet = useConnectedWallet();
  const connectWalletModal = useConnectWalletModal();
  const settingsModal = useSettingsModal({
    items: ["slippageTolerance", "txDeadline"],
  });
  const { value: txDeadlineMinutes } = useTxDeadlineMinutes();
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { getPair, pairs } = usePairs();
  const { getAsset } = useAssets();
  const [isReversed, setIsReversed] = useState(false);
  const [balanceApplied, setBalanceApplied] = useState(false);
  const network = useNetwork();
  const { value: slippageTolerance } = useSlippageTolerance();

  const handleModalClose = useCallback(() => {
    navigate("..", { replace: true, relative: "route" });
  }, [navigate]);
  const { requestPost } = useRequestPost(handleModalClose, true);
  const errorMessageModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const pair = useMemo(
    () => (poolAddress ? getPair(poolAddress) : undefined),
    [getPair, poolAddress],
  );

  const [asset1, asset2] = useMemo(
    () => (pair?.asset_addresses || []).map((address) => getAsset(address)),
    [getAsset, pair?.asset_addresses],
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!asset1 || !asset2) {
        errorMessageModal.open();
      }
    }, 1500);
    if (asset1 && asset2) {
      errorMessageModal.close();
    }
    if (poolAddress && !AccAddress.validate(poolAddress)) {
      errorMessageModal.open();
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [asset1, asset2, errorMessageModal, network, poolAddress]);

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = form.watch();

  const pool = usePool(poolAddress);
  const isPoolEmpty = useMemo(
    () =>
      pool?.total_share !== undefined &&
      Numeric.parse(pool.total_share).isZero(),
    [pool?.total_share],
  );

  const simulationResult = useSimulate(
    isPoolEmpty
      ? {
          pairAddress: poolAddress || "",
          asset1Address: asset1?.token || "",
          asset1Amount:
            valueToAmount(formData.asset1Value, asset1?.decimals) || "0",
          asset2Address: asset2?.token || "",
          asset2Amount:
            valueToAmount(formData.asset2Value, asset2?.decimals) || "0",
        }
      : {
          pairAddress: poolAddress || "",
          asset1Address: isReversed ? asset2?.token || "" : asset1?.token || "",
          asset1Amount: isReversed
            ? valueToAmount(formData.asset2Value, asset2?.decimals) || "0"
            : valueToAmount(formData.asset1Value, asset1?.decimals) || "0",
        },
  );

  const createTxOptions = useMemo<CreateTxOptions | undefined>(
    () =>
      simulationResult?.estimatedAmount &&
      !simulationResult?.isLoading &&
      connectedWallet &&
      asset1?.token &&
      formData.asset1Value &&
      asset2?.token &&
      formData.asset2Value &&
      !Numeric.parse(formData.asset1Value).isNaN() &&
      !Numeric.parse(formData.asset2Value).isNaN()
        ? {
            msgs: generateAddLiquidityMsg(
              connectedWallet?.network.name as NetworkName,
              connectedWallet.walletAddress,
              poolAddress || "",
              [
                {
                  address: asset1?.token || "",
                  amount:
                    valueToAmount(formData.asset1Value, asset1?.decimals) ||
                    "0",
                },
                {
                  address: asset2?.token || "",
                  amount:
                    valueToAmount(formData.asset2Value, asset2?.decimals) ||
                    "0",
                },
              ],
              `${slippageTolerance}`,
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

  const asset1BalanceMinusFee = useBalanceMinusFee(asset1?.token, feeAmount);

  const asset2BalanceMinusFee = useBalanceMinusFee(asset2?.token, feeAmount);

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
        return `Enter ${asset2?.symbol} amount`;
      }
      return "Add";
    }

    if (formData.asset2Value && !formData.asset1Value) {
      return `Enter ${asset1?.symbol} amount`;
    }

    return "Enter an amount";
  }, [
    asset1,
    asset2,
    asset1BalanceMinusFee,
    formData.asset1Value,
    formData.asset2Value,
  ]);

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

  const ratio = useMemo(() => {
    if (!Number(formData.asset1Value) || !Number(formData.asset2Value)) {
      return [0, 0];
    }
    const value1 = Numeric.parse(formData.asset1Value)
      .dividedBy(Numeric.parse(formData.asset1Value).add(formData.asset2Value))
      .mul(100)
      .toNumber();
    return [value1, 100 - value1];
  }, [formData.asset1Value, formData.asset2Value]);

  useEffect(() => {
    if (
      connectedWallet &&
      balanceApplied &&
      (!isReversed || isPoolEmpty) &&
      asset1?.token === XPLA_ADDRESS &&
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
      (isReversed || isPoolEmpty) &&
      asset2?.token === XPLA_ADDRESS &&
      formData.asset2Value &&
      Numeric.parse(formData.asset2Value || 0).gt(
        Numeric.parse(
          amountToValue(asset2BalanceMinusFee, asset2?.decimals) || 0,
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
    if (simulationResult && !simulationResult.isLoading && !isPoolEmpty) {
      form.setValue(
        isReversed ? FormKey.asset1Value : FormKey.asset2Value,
        amountToValue(
          simulationResult.estimatedAmount,
          isReversed ? asset1?.decimals : asset2?.decimals,
        ) || "",
        { shouldValidate: true },
      );
    }
  }, [simulationResult, isPoolEmpty]);

  return (
    <Modal
      id="provide-modal"
      className="modal-parent"
      isOpen
      title="Add liquidity"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={() => handleModalClose()}
      headerExtra={
        <IconButton
          size={38}
          icons={{ default: iconSetting, hover: iconSettingHover }}
          onClick={() => settingsModal.open()}
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          controllerProps={{
            name: FormKey.asset1Value,
            control: form.control,
            rules: {
              required: true,
            },
          }}
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
          controllerProps={{
            name: FormKey.asset2Value,
            control: form.control,
            rules: {
              required: true,
            },
          }}
          asset={asset2}
          onClick={() => {
            setIsReversed(false);
            setBalanceApplied(false);
          }}
          onBalanceClick={(value) => {
            setIsReversed(false);
            setBalanceApplied(true);
            form.setValue(FormKey.asset2Value, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
        />
        {isPoolEmpty && (
          <Box
            css={css`
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            `}
          >
            <ProgressBar
              value={ratio[0]}
              disabled={
                !Number(formData.asset1Value) || !Number(formData.asset2Value)
              }
              label={[
                `${asset1?.symbol} ${formatRatio(ratio[0])}%`,
                `${asset2?.symbol} ${formatRatio(ratio[1])}%`,
              ]}
            />
          </Box>
        )}
        <div
          css={css`
            margin-bottom: ${isPoolEmpty ? "10px" : "20px"};
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
              <InfoTable
                items={
                  isPoolEmpty
                    ? [
                        {
                          key: "totalLp",
                          label: "Total LP supply",
                          tooltip:
                            "The sum of Locked LP supply and Received LP supply.",
                          value: `${formatNumber(
                            cutDecimal(
                              amountToValue(
                                simulationResult?.share,
                                LP_DECIMALS,
                              ) || 0,
                              DISPLAY_DECIMAL,
                            ),
                          )} LP`,
                        },
                        {
                          key: "lockedLp",
                          label: "Locked LP supply",
                          tooltip:
                            "The amount of LP locked by contract to create a new pool.",
                          value: `${formatNumber(
                            cutDecimal(
                              amountToValue(LOCKED_LP_SUPPLY, LP_DECIMALS) || 0,
                              DISPLAY_DECIMAL,
                            ),
                          )} LP`,
                        },
                        {
                          key: "receivedLp",
                          label: "Received LP supply",
                          tooltip:
                            "The amount of LP you may get at the transaction.",
                          value: `${formatNumber(
                            cutDecimal(
                              amountToValue(
                                Numeric.parse(simulationResult?.share || 0)
                                  .minus(LOCKED_LP_SUPPLY)
                                  .toString(),
                                LP_DECIMALS,
                              ) || 0,
                              DISPLAY_DECIMAL,
                            ),
                          )} LP`,
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
                          value: feeAmount
                            ? `${formatNumber(
                                cutDecimal(
                                  amountToValue(feeAmount) || "0",
                                  DISPLAY_DECIMAL,
                                ),
                              )} ${XPLA_SYMBOL}`
                            : "",
                        },
                      ]
                    : [
                        {
                          key: "lpSupply",
                          label: "LP supply",
                          tooltip: (
                            <>
                              The expected amount of LP
                              <br />
                              you may get at the transaction.
                            </>
                          ),
                          value: `${formatNumber(
                            cutDecimal(
                              amountToValue(
                                simulationResult?.share,
                                LP_DECIMALS,
                              ) || 0,
                              DISPLAY_DECIMAL,
                            ),
                          )} LP`,
                        },
                        {
                          key: "poolLiquidity1",
                          label: `Pool liquidity (${asset1?.symbol || ""})`,
                          tooltip: (
                            <>
                              Total liquidity of {asset1?.symbol || ""}
                              <br />
                              before adding.
                            </>
                          ),
                          value: `${
                            formatNumber(
                              cutDecimal(
                                amountToValue(
                                  pool?.assets?.find((a) =>
                                    "token" in a.info
                                      ? a.info.token.contract_addr
                                      : a.info.native_token.denom ===
                                        asset1?.token,
                                  )?.amount,
                                  asset1?.decimals,
                                ) || "0",
                                DISPLAY_DECIMAL,
                              ),
                            ) || "-"
                          } ${asset1?.symbol || ""}`,
                        },
                        {
                          key: "poolLiquidity2",
                          label: `Pool liquidity (${asset2?.symbol || ""})`,
                          tooltip: (
                            <>
                              Total liquidity of {asset2?.symbol || ""}
                              <br />
                              before adding.
                            </>
                          ),
                          value: `${
                            formatNumber(
                              cutDecimal(
                                amountToValue(
                                  pool?.assets?.find((a) =>
                                    "token" in a.info
                                      ? a.info.token.contract_addr
                                      : a.info.native_token.denom ===
                                        asset2?.token,
                                  )?.amount,
                                  asset2?.decimals,
                                ) || "0",
                                DISPLAY_DECIMAL,
                              ),
                            ) || "-"
                          } ${asset2?.symbol || ""}`,
                        },
                        {
                          key: "yourShare",
                          label: "Your share",
                          tooltip: "Share of the total liquidity.",
                          value: `${
                            formatNumber(
                              cutDecimal(
                                simulationResult?.percentageOfShare || 0,
                                DISPLAY_DECIMAL,
                              ),
                            ) || "-"
                          }%`,
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
                          value: feeAmount
                            ? `${formatNumber(
                                cutDecimal(
                                  amountToValue(feeAmount) || "0",
                                  DISPLAY_DECIMAL,
                                ),
                              )} ${XPLA_SYMBOL}`
                            : "",
                        },
                      ]
                }
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
                        {ellipsisCenter(pair?.liquidity_token)}&nbsp;
                        <a
                          href={getTokenLink(
                            pair?.liquidity_token,
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
                  {
                    key: "asset1Address",
                    label: `${asset1?.symbol || ""} Address`,
                    value: (
                      <span>
                        {ellipsisCenter(asset1?.token)}&nbsp;
                        <a
                          href={getTokenLink(asset1?.token, network.name)}
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
                  {
                    key: "asset2Address",
                    label: `${asset2?.symbol || ""} Address`,
                    value: (
                      <span>
                        {ellipsisCenter(asset2?.token)}&nbsp;
                        <a
                          href={getTokenLink(asset2?.token, network.name)}
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
        {isPoolEmpty && (
          <div
            css={css`
              margin-bottom: 20px;
            `}
          >
            {formData.asset1Value && formData.asset2Value ? (
              <Message variant="error">
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
                    Providing a liquidity of {formatNumber(LOCKED_LP_SUPPLY)} LP
                    minimum is required to create a new pool.
                  </Col>
                </Row>
              </Message>
            ) : (
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
                    Empty pool - Please add liquidity to both tokens
                  </Col>
                </Row>
              </Message>
            )}
          </div>
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

export default ProvidePage;
