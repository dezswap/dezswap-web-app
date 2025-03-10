import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "components/Modal";
import { useNavigate, useParams } from "react-router-dom";
import useAssets from "hooks/useAssets";
import { useForm } from "react-hook-form";
import { useScreenClass } from "react-grid-system";
import { css } from "@emotion/react";
import iconProvide from "assets/icons/icon-provide.svg";
import Expand from "components/Expanded";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatDecimals,
  formatNumber,
  getTokenLink,
  revertIbcTokenAddressInPath,
  formatRatio,
  valueToAmount,
} from "utils";
import { LOCKED_LP_SUPPLY, LP_DECIMALS } from "constants/dezswap";
import { CreateTxOptions, Numeric } from "@xpla/xpla.js";
import Typography from "components/Typography";
import useBalanceMinusFee from "hooks/useBalanceMinusFee";
import useFee from "hooks/useFee";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import { generateCreatePoolMsg } from "utils/dezswap";
import { NetworkName } from "types/common";
import { useConnectedWallet } from "@xpla/wallet-provider";
import InputGroup from "pages/Earn/Pools/Provide/InputGroup";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link.svg";
import useRequestPost from "hooks/useRequestPost";
import useNetwork from "hooks/useNetwork";
import Message from "components/Message";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import InfoTable from "components/InfoTable";
import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";
import useSettingsModal from "hooks/modals/useSettingsModal";
import box from "components/Box";
import ProgressBar from "components/ProgressBar";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import styled from "@emotion/styled";
import useWalletAddress from "hooks/useWalletAddress";

enum FormKey {
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

const DISPLAY_DECIMAL = 3;

const Box = styled(box)`
  & > * {
    margin-bottom: 5px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
`;

function CreatePage() {
  const connectedWallet = useConnectedWallet();
  const connectWalletModal = useConnectWalletModal();
  const settingsModal = useSettingsModal({
    items: ["txDeadline"],
  });
  const assetAddresses = useParams<{
    asset1Address: string;
    asset2Address: string;
  }>();
  const { asset1Address, asset2Address } = useMemo(() => {
    return {
      asset1Address: revertIbcTokenAddressInPath(assetAddresses.asset1Address),
      asset2Address: revertIbcTokenAddressInPath(assetAddresses.asset2Address),
    };
  }, [assetAddresses]);
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { getAsset, validate } = useAssets();
  const { walletAddress } = useWalletAddress();
  const [balanceApplied, setBalanceApplied] = useState(false);
  const network = useNetwork();

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = form.watch();

  const handleModalClose = useCallback(() => {
    navigate("..", { replace: true, relative: "route" });
  }, [navigate]);

  const handleTxSuccess = useCallback(() => {
    window.location.replace("/pool");
  }, []);

  const { requestPost } = useRequestPost(handleTxSuccess, true);
  const errorMessageModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const [asset1, asset2] = useMemo(() => {
    const assets =
      asset1Address && asset2Address
        ? [asset1Address, asset2Address].map(
            (address) => getAsset(address) || null,
          )
        : [undefined, undefined];
    return assets;
  }, [asset1Address, asset2Address, getAsset]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (asset1 === null || asset2 === null) {
        errorMessageModal.open();
      }
    }, 1500);
    if (asset1 && asset2) {
      errorMessageModal.close();
    }

    if (
      !validate(asset1Address) ||
      !validate(asset2Address) ||
      asset1Address === asset2Address
    ) {
      errorMessageModal.open();
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [
    asset1,
    asset1Address,
    asset2,
    asset2Address,
    errorMessageModal,
    network,
    validate,
  ]);

  const createTxOptions = useMemo<CreateTxOptions | undefined>(
    () =>
      connectedWallet &&
      asset1?.token &&
      formData.asset1Value &&
      asset2?.token &&
      formData.asset2Value &&
      !Numeric.parse(formData.asset1Value).isNaN() &&
      !Numeric.parse(formData.asset2Value).isNaN()
        ? {
            msgs: generateCreatePoolMsg(
              connectedWallet?.network.name as NetworkName,
              walletAddress,
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
            ),
          }
        : undefined,
    [
      connectedWallet,
      asset1,
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

  const asset1Balance = useBalanceMinusFee(asset1?.token, feeAmount);
  const asset2Balance = useBalanceMinusFee(asset2?.token, feeAmount);

  useEffect(() => {
    if (
      connectedWallet &&
      balanceApplied &&
      asset1?.token === XPLA_ADDRESS &&
      formData.asset1Value &&
      Numeric.parse(formData.asset1Value || 0).gt(
        Numeric.parse(amountToValue(asset1Balance, asset1?.decimals) || 0),
      )
    ) {
      form.setValue(
        FormKey.asset1Value,
        amountToValue(asset1Balance, asset1?.decimals) || "",
        {
          shouldValidate: true,
        },
      );
    }
  }, [asset1Balance, formData.asset1Value, form]);

  useEffect(() => {
    if (
      connectedWallet &&
      balanceApplied &&
      asset2?.token === XPLA_ADDRESS &&
      formData.asset2Value &&
      Numeric.parse(formData.asset2Value || 0).gt(
        Numeric.parse(amountToValue(asset2Balance, asset2?.decimals) || 0),
      )
    ) {
      form.setValue(
        FormKey.asset2Value,
        amountToValue(asset2Balance, asset2?.decimals) || "",
        {
          shouldValidate: true,
        },
      );
    }
  }, [asset2Balance, formData.asset2Value, form]);

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

  const estimatedLp = useMemo(() => {
    if (!asset1 || !asset2) {
      return "0";
    }
    if (!formData.asset1Value && !formData.asset2Value) {
      return "0";
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
    if (!formData.asset1Value || Numeric.parse(formData.asset1Value).lte(0)) {
      return `Enter ${asset1.symbol} amount`;
    }
    if (!formData.asset2Value || Numeric.parse(formData.asset2Value).lte(0)) {
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
          controllerProps={{
            name: FormKey.asset1Value,
            control: form.control,
            rules: {
              required: true,
            },
          }}
          asset={asset1}
          onClick={() => {
            setBalanceApplied(false);
          }}
          onBalanceClick={(value) => {
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
            setBalanceApplied(false);
          }}
          onBalanceClick={(value) => {
            setBalanceApplied(true);
            form.setValue(FormKey.asset2Value, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
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
              `${asset1?.symbol} ${formatRatio(ratio[0])}%`,
              `${asset2?.symbol} ${formatRatio(ratio[1])}%`,
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
                      cutDecimal(
                        amountToValue(estimatedLp, LP_DECIMALS) || 0,
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
                    tooltip: "The amount of LP you may get at the transaction.",
                    value: `${formatNumber(
                      cutDecimal(
                        amountToValue(
                          Numeric.parse(estimatedLp || 0)
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
                items={[asset1, asset2].map((asset) => ({
                  key: asset?.token,
                  label: `${asset?.symbol} Address`,
                  value: (
                    <>
                      {ellipsisCenter(asset?.token)}&nbsp;
                      <a
                        href={getTokenLink(asset?.token, network.name)}
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
              Please be aware that the initial liquidity provision deducts&nbsp;
              {formatNumber(
                amountToValue(LOCKED_LP_SUPPLY, LP_DECIMALS) || "0",
              )}
              &nbsp;LP from the share a user will receive and lock in its pair
              for protection.
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
