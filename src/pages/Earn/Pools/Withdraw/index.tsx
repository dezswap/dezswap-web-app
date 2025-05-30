import { FormEventHandler, useCallback, useEffect, useMemo } from "react";
import Typography from "components/Typography";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import InputGroup from "pages/Earn/Pools/Withdraw/InputGroup";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatDecimals,
  formatNumber,
  getTokenLink,
  valueToAmount,
} from "utils";
import iconWithdraw from "assets/icons/icon-withdraw.svg";
import Expand from "components/Expanded";
import { Col, Row, useScreenClass } from "react-grid-system";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import Button from "components/Button";
import Modal from "components/Modal";
import { useParams } from "react-router-dom";
import useSimulate from "pages/Earn/Pools/Withdraw/useSimulate";
import usePairs from "hooks/usePairs";
import useNetwork from "hooks/useNetwork";
import { useForm } from "react-hook-form";
import useAssets from "hooks/useAssets";
import { css, useTheme } from "@emotion/react";
import Box from "components/Box";
import Hr from "components/Hr";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { AccAddress, Numeric } from "@xpla/xpla.js";
import useRequestPost from "hooks/useRequestPost";
import useFee from "hooks/useFee";
import { generateWithdrawLiquidityMsg } from "utils/dezswap";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import { nativeTokens, XPLA_SYMBOL } from "constants/network";
import { LP_DECIMALS } from "constants/dezswap";
import useBalance from "hooks/useBalance";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import InfoTable from "components/InfoTable";
import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";
import { useNavigate } from "hooks/useNavigate";
import useSettingsModal from "hooks/modals/useSettingsModal";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import useDashboardTokenDetail from "hooks/dashboard/useDashboardTokenDetail";
import useConnectedWallet from "hooks/useConnectedWallet";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";

enum FormKey {
  lpValue = "lpValue",
}

function WithdrawPage() {
  const connectWalletModal = useConnectWalletModal();
  const settingsModal = useSettingsModal({
    items: ["slippageTolerance", "txDeadline"],
  });
  const { value: slippageTolerance } = useSlippageTolerance();
  const { value: txDeadlineMinutes } = useTxDeadlineMinutes();
  const theme = useTheme();
  const screenClass = useScreenClass();
  const { walletAddress } = useConnectedWallet();
  const navigate = useNavigate();
  const {
    chainName,
    selectedChain: { explorers },
  } = useNetwork();

  const handleModalClose = useCallback(() => {
    navigate("..", { replace: true, relative: "route" });
  }, [navigate]);

  const { requestPost } = useRequestPost(handleModalClose, true);
  const errorMessageModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { getPair } = usePairs();
  const pair = useMemo(
    () => (poolAddress ? getPair(poolAddress) : undefined),
    [getPair, poolAddress],
  );
  const { getAsset } = useAssets();
  const [asset1, asset2] = useMemo(
    () =>
      pair
        ? pair.asset_addresses.map((address) => getAsset(address))
        : [undefined, undefined],
    [getAsset, pair],
  );

  const dashboardToken1 = useDashboardTokenDetail(asset1?.token || "");
  const dashboardToken2 = useDashboardTokenDetail(asset2?.token || "");

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!asset1?.token || !asset2?.token) {
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
  }, [asset1, asset2, errorMessageModal, chainName, poolAddress]);

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const { register } = form;

  const { lpValue } = form.watch();

  const simulationResult = useSimulate(
    poolAddress || "",
    pair?.liquidity_token || "",
    valueToAmount(lpValue, LP_DECIMALS) || "0",
  );

  const [simulatedValue1, simulatedValue2] = useMemo(() => {
    return [asset1, asset2].map(
      (asset) =>
        amountToValue(
          simulationResult?.estimatedAmount?.find(
            (a) => a.address === asset?.token,
          )?.amount,
          asset?.decimals,
        ) || "0",
    );
  }, [asset1, asset2, simulationResult]);

  const balance = useBalance(pair?.liquidity_token || "");

  const isLpPayable = useMemo(
    () =>
      lpValue &&
      Numeric.parse(
        valueToAmount(lpValue, LP_DECIMALS) || "0",
      ).lessThanOrEqualTo(balance || "0"),
    [lpValue, balance],
  );

  const createTxOptions = useMemo<MsgExecuteContract[] | undefined>(
    () =>
      !simulationResult?.isLoading &&
      !simulationResult?.isFailed &&
      walletAddress &&
      isLpPayable
        ? [
            generateWithdrawLiquidityMsg(
              walletAddress || "",
              poolAddress || "",
              pair?.liquidity_token || "",
              valueToAmount(lpValue, LP_DECIMALS) || "0",
              [asset1?.token, asset2?.token].map((address) => ({
                address: address || "",
                amount: Numeric.parse(
                  simulationResult?.estimatedAmount?.find(
                    (a) => a.address === address,
                  )?.amount || "0",
                )
                  .mul(Numeric.parse((1 - slippageTolerance / 100).toString()))
                  .toFixed(0),
              })),
              txDeadlineMinutes ? txDeadlineMinutes * 60 : undefined,
            ),
          ]
        : undefined,
    [walletAddress, simulationResult, lpValue],
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
          txOptions: { msgs: createTxOptions },
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

      return "Remove";
    }

    return "Enter an amount";
  }, [lpValue, isLpPayable]);

  return (
    <Modal
      id="withdraw-modal"
      className="modal-parent"
      isOpen
      title="Remove liquidity"
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
            name: FormKey.lpValue,
            control: form.control,
            rules: {
              required: true,
            },
          }}
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
                      font-size: 16px;
                      font-weight: 700;
                    `}
                  >
                    <img
                      src={asset1?.icon || iconDefaultToken}
                      width={24}
                      alt={asset1?.symbol}
                      css={css`
                        margin-right: 4px;
                        background-color: ${theme.colors.white};
                        border-radius: 50%;
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
                {formatNumber(simulatedValue1)}
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
                {simulatedValue1 && dashboardToken1?.price
                  ? `= $${formatNumber(
                      formatDecimals(
                        Numeric.parse(simulatedValue1).mul(
                          dashboardToken1.price,
                        ),
                        2,
                      ),
                    )}`
                  : "-"}
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
                      font-size: 16px;
                      font-weight: 700;
                    `}
                  >
                    <img
                      src={asset2?.icon || iconDefaultToken}
                      width={24}
                      alt={asset2?.symbol}
                      css={css`
                        margin-right: 4px;
                        background-color: ${theme.colors.white};
                        border-radius: 50%;
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
                {formatNumber(simulatedValue2)}
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
                {simulatedValue2 && dashboardToken2?.price
                  ? `= $${formatNumber(
                      formatDecimals(
                        Numeric.parse(simulatedValue2).mul(
                          dashboardToken2.price,
                        ),
                        2,
                      ),
                    )}`
                  : "-"}
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
                {`${asset1?.symbol || ""} - ${asset2?.symbol || ""}`}
              </Typography>
            }
            preview={
              <InfoTable
                items={[
                  {
                    key: "expectedAmount",
                    label: "Expected amount",
                    tooltip: (
                      <>
                        The result value you may get
                        <br />
                        at the current condition.
                      </>
                    ),
                    value: `${formatNumber(simulatedValue1)} ${
                      asset1?.symbol || ""
                    }
                      ${formatNumber(simulatedValue2)} ${asset2?.symbol || ""}`,
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
                        amount={
                          fee?.amount
                            ?.get(nativeTokens?.[chainName]?.[0].token)
                            ?.amount.toString() || "0"
                        }
                      />
                    ),
                  },
                ]}
              />
            }
          >
            <InfoTable
              items={[
                {
                  key: "lp",
                  label: "LP",
                  tooltip: (
                    <>
                      The provided assets will
                      <br />
                      be distributed from the LP.
                    </>
                  ),
                  value: formatNumber(lpValue),
                },
                {
                  key: "yourShare",
                  label: "Your share",
                  tooltip: "Share of the total liquidity.",
                  value: `${formatNumber(
                    cutDecimal(
                      simulationResult.percentageOfShare || "0",
                      DISPLAY_DECIMAL,
                    ),
                  )}%`,
                },
                {
                  key: "asset1Address",
                  label: `${asset1?.symbol} Address`,
                  value: (
                    <>
                      {ellipsisCenter(asset1?.token)}&nbsp;
                      <a
                        href={getTokenLink(asset1?.token, explorers?.[0].url)}
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
                    </>
                  ),
                },
                {
                  key: "asset2Address",
                  label: `${asset2?.symbol} Address`,
                  value: (
                    <>
                      {ellipsisCenter(asset2?.token)}&nbsp;
                      <a
                        href={getTokenLink(asset2?.token, explorers?.[0].url)}
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
                    </>
                  ),
                },
              ]}
            />
          </Expand>
        </div>
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
