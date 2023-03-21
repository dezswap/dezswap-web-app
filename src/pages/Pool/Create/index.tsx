import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "components/Modal";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import usePairs from "hooks/usePair";
import useAssets from "hooks/useAssets";
import { useForm } from "react-hook-form";
import { Col, Row, useScreenClass } from "react-grid-system";
import { css, useTheme } from "@emotion/react";
import iconProvide from "assets/icons/icon-provide.svg";
import Expand from "components/Expanded";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  filterNumberFormat,
  formatDecimals,
  formatNumber,
  getTokenLink,
  valueToAmount,
} from "utils";
import { LOCKED_LP_SUPPLY, LP_DECIMALS } from "constants/dezswap";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import Typography from "components/Typography";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import { useFee } from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { generateCreatePoolMsg } from "utils/dezswap";
import { NetworkName } from "types/common";
import { useConnectedWallet } from "@xpla/wallet-provider";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import InputGroup from "pages/Pool/Provide/InputGroup";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import useRequestPost from "hooks/useRequestPost";
import { useNetwork } from "hooks/useNetwork";
import Message from "components/Message";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import InfoTable from "components/InfoTable";
import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";
import useSettingsModal from "hooks/modals/useSettingsModal";
import Box from "components/Box";
import ProgressBar from "components/ProgressBar";
import { useBalance } from "hooks/useBalance";

enum FormKey {
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

const DISPLAY_DECIMAL = 3;

const MOBILE_DISPLAY_NUMBER_CNT = 20;
const BROWSER_DISPLAY_NUMBER_CNT = 31;

function CreatePage() {
  const theme = useTheme();
  const connectedWallet = useConnectedWallet();
  const connectWalletModal = useConnectWalletModal();
  const settingsModal = useSettingsModal({
    items: ["txDeadline"],
  });
  const { asset1Address, asset2Address } = useParams<{
    asset1Address: string;
    asset2Address: string;
  }>();
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { getAsset } = useAssets();
  const [isReversed, setIsReversed] = useState(false);
  const [balanceApplied, setBalanceApplied] = useState(false);
  const network = useNetwork();
  const [asset1, asset2] = useMemo(
    () =>
      asset1Address && asset2Address
        ? [asset1Address, asset2Address].map((address) => getAsset(address))
        : [],
    [asset1Address, asset2Address, getAsset],
  );

  const asset1Balance = useBalanceMinusFee(asset1?.address, asset1?.balance);
  const asset2Balance = useBalanceMinusFee(asset2?.address, asset2?.balance);

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = form.watch();
  const { register, formState } = form;

  const handleModalClose = useCallback(() => {
    navigate("/pool", { replace: true });
  }, [navigate]);

  const { requestPost } = useRequestPost(handleModalClose, true);

  const createTxOptions = useMemo<CreateTxOptions | undefined>(
    () =>
      connectedWallet &&
      asset1?.address &&
      formData.asset1Value &&
      asset2?.address &&
      formData.asset2Value &&
      !Numeric.parse(formData.asset1Value).isNaN() &&
      !Numeric.parse(formData.asset2Value).isNaN()
        ? {
            msgs: generateCreatePoolMsg(
              connectedWallet?.network.name as NetworkName,
              connectedWallet.walletAddress,
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
            ),
          }
        : undefined,
    [
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
    return [formData.asset1Value, formData.asset2Value].map((value) =>
      Numeric.parse(value)
        .dividedBy(
          Numeric.parse(formData.asset1Value).add(formData.asset2Value),
        )
        .mul(100)
        .toDP(0)
        .toNumber(),
    );
  }, [formData.asset1Value, formData.asset2Value]);

  const estimatedLp = useMemo(() => {
    if (!asset1 || !asset2) {
      return 0;
    }
    if (!formData.asset1Value && !formData.asset2Value) {
      return 0;
    }
    return formatDecimals(
      Numeric.parse(valueToAmount(formData.asset1Value, asset1?.decimals) || 0)
        .mul(valueToAmount(formData.asset2Value, asset2?.decimals) || 0)
        .sqrt(),
      LP_DECIMALS,
    );
  }, [asset1, asset2, formData.asset1Value, formData.asset2Value]);

  const buttonMessage = useMemo(() => {
    if (!asset1 || !asset2) {
      return "Loading...";
    }
    if (!formData.asset1Value && !formData.asset2Value) {
      return "Enter an amount";
    }
    if (!formData.asset1Value) {
      return `Enter ${asset1.symbol} amount`;
    }
    if (!formData.asset2Value) {
      return `Enter ${asset2.symbol} amount`;
    }
    if (
      Numeric.parse(formData.asset1Value).gt(
        amountToValue(asset1Balance, asset1?.decimals) || 0,
      )
    ) {
      return `Insufficient ${asset1?.symbol} balance`;
    }
    if (
      Numeric.parse(formData.asset2Value).gt(
        amountToValue(asset2Balance, asset2?.decimals) || 0,
      )
    ) {
      return `Insufficient ${asset2?.symbol} balance`;
    }
    return "Create";
  }, [asset1, asset1Balance, asset2, asset2Balance, formData]);

  const isValid = useMemo(() => {
    return buttonMessage === "Create";
  }, [buttonMessage]);

  return (
    <Modal
      id="create-pool-modal"
      className="modal-parent"
      isOpen
      title="Create a new pool"
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
              `${asset1?.symbol} ${ratio[0]}%`,
              `${asset2?.symbol} ${ratio[1]}%`,
            ]}
          />
        </Box>
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <Expand
            label={
              <Typography weight="bold">
                {`1 ${asset1?.symbol} = ${
                  formData.asset1Value && formData.asset2Value
                    ? cutDecimal(
                        Numeric.parse(formData.asset2Value || 0)
                          .div(formData.asset1Value || 1)
                          .toString(),
                        DISPLAY_DECIMAL,
                      )
                    : "-"
                } ${asset2?.symbol}`}
              </Typography>
            }
            preview={
              <InfoTable
                items={[
                  {
                    key: "totalLp",
                    label: "Total LP supply",
                    tooltip:
                      "The sum of Locked LP supply and Received LP supply.",
                    value: `${formatNumber(
                      cutDecimal(estimatedLp, DISPLAY_DECIMAL),
                    )} LP`,
                  },
                  {
                    key: "lockedLp",
                    label: "Locked LP supply",
                    tooltip:
                      "The amount of LP locked by contract to create a new pool.",
                    value: `${formatNumber(LOCKED_LP_SUPPLY)} LP`,
                  },
                  {
                    key: "receivedLp",
                    label: "Received LP supply",
                    tooltip: "The amount of LP you may get at the transaction.",
                    value: `${formatNumber(
                      cutDecimal(
                        Numeric.parse(estimatedLp || 0)
                          .minus(LOCKED_LP_SUPPLY)
                          .toString(),
                        DISPLAY_DECIMAL,
                      ),
                    )} LP`,
                  },
                  {
                    key: "fee",
                    label: "Fee",
                    tooltip: "The fee paid for executing the transaction.",
                    value: "0 XPLA",
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
                items={[asset1, asset2].map((asset) => ({
                  key: asset?.address,
                  label: `${asset?.symbol} Address`,
                  value: (
                    <>
                      {ellipsisCenter(asset?.address)}&nbsp;
                      <a
                        href={getTokenLink(asset?.address, network.name)}
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
                }))}
              />
            </div>
          </Expand>
          <div
            css={css`
              margin-top: 9px;
            `}
          >
            <Message variant="error">
              Providing a liquidity of {formatNumber(LOCKED_LP_SUPPLY)} LP
              minimum is required to create a new pool.
            </Message>
          </div>
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
              !isValid ||
              isFeeLoading ||
              isFeeFailed
            }
            css={css`
              margin-bottom: 10px;
            `}
          >
            {buttonMessage}
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

export default CreatePage;
