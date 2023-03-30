import { css, useTheme } from "@emotion/react";
import { AccAddress } from "@xpla/xpla.js";
import Button from "components/Button";
import Input from "components/Input";
import Message from "components/Message";
import Modal from "components/Modal";
import Typography from "components/Typography";
import { useAPI } from "hooks/useAPI";
import { useBalance } from "hooks/useBalance";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import ReactModal from "react-modal";
import { TokenInfo } from "types/token";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { amountToValue, cutDecimal, formatNumber } from "utils";
import {
  DISPLAY_DECIMAL,
  MOBILE_SCREEN_CLASS,
  MODAL_CLOSE_TIMEOUT_MS,
} from "constants/layout";
import useCustomAssets from "hooks/useCustomAssets";
import { useScreenClass } from "react-grid-system";
import usePairs from "hooks/usePair";
import { Asset } from "types/common";

interface ImportAssetModalProps extends ReactModal.Props {
  onFinish?(asset: Asset): void;
}

function ImportAssetModal({ onFinish, ...modalProps }: ImportAssetModalProps) {
  const screenClass = useScreenClass();
  const theme = useTheme();
  const [address, setAddress] = useState("");
  const [page, setPage] = useState<"form" | "confirm">("form");
  const { customAssets, addCustomAsset } = useCustomAssets();
  const { availableAssetAddresses } = usePairs();

  const api = useAPI();

  const balance = useBalance(address);
  const deferredAddress = useDeferredValue(address);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>();
  const isValidAddress = useMemo(() => {
    return AccAddress.validate(address);
  }, [address]);
  const isDuplicated = useMemo(() => {
    return (
      customAssets?.some((item) => item.address === address) ||
      availableAssetAddresses?.addresses?.some((item) => item === address)
    );
  }, [address, availableAssetAddresses, customAssets]);

  const errorMessage = useMemo(() => {
    if (!address) {
      return undefined;
    }
    if (!isValidAddress) {
      return "Only token contract address is allowed.";
    }
    if (isValidAddress && !tokenInfo) {
      return "Invalid token address. Please check the address again.";
    }
    if (isValidAddress && isDuplicated) {
      return "You can't import the token already in the list.";
    }
    return undefined;
  }, [address, isValidAddress, tokenInfo, isDuplicated]);

  useEffect(() => {
    let isAborted = false;
    const fetchAsset = async () => {
      if (isValidAddress) {
        try {
          const res = await api.getToken(deferredAddress);
          if (!isAborted) {
            setTokenInfo(res);
          }
        } catch (error) {
          console.log(error);
          if (!isAborted) {
            setTokenInfo(undefined);
          }
        }
      }
    };

    fetchAsset();
    return () => {
      isAborted = true;
    };
  }, [api, deferredAddress, isValidAddress]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setPage("confirm");
  };

  const onConfirm: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (tokenInfo) {
      const asset = { ...tokenInfo, balance: balance || "0", address };
      addCustomAsset(asset);
      if (onFinish) {
        onFinish(asset);
      }
    }
  };

  useEffect(() => {
    if (!modalProps.isOpen) {
      setTimeout(() => {
        setAddress("");
        setPage("form");
      }, MODAL_CLOSE_TIMEOUT_MS);
    }
  }, [modalProps.isOpen]);

  return (
    <Modal
      {...modalProps}
      title="Import a token"
      hasCloseButton
      hasGoBackButton={page === "confirm"}
      onGoBack={() => setPage("form")}
      drawer={screenClass === MOBILE_SCREEN_CLASS}
    >
      <Typography
        color="danger"
        size={16}
        weight={400}
        css={css`
          margin-bottom: 20px;
        `}
      >
        Before manually importing a token, make sure it&apos;s credible by doing
        your research.
      </Typography>
      <div
        css={css`
          margin-bottom: 10px;
        `}
      >
        {page === "form" && (
          <form onSubmit={onSubmit}>
            <Typography
              color="primary"
              size={14}
              weight={900}
              css={css`
                margin-bottom: 6px;
              `}
            >
              Token contract address
            </Typography>
            <div
              css={css`
                padding-bottom: 10px;
              `}
            >
              <Input
                value={address}
                size="large"
                variant="primary"
                align="left"
                height={50}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                }}
                css={css`
                  &::placeholder {
                    text-align: center !important;
                  }
                  &:focus::placeholder {
                    opacity: 0;
                  }
                `}
                borderStyle="solid"
                placeholder="Paste token contract address"
                onChange={(event) => {
                  setAddress(event.target.value);
                }}
              />
            </div>
            <div
              css={css`
                padding-bottom: 10px;
              `}
            >
              {errorMessage && (
                <div
                  css={css`
                    padding-bottom: 10px;
                  `}
                >
                  <Message variant="error">{errorMessage}</Message>
                </div>
              )}
            </div>
            <Button
              variant="primary"
              block
              size="large"
              type="submit"
              disabled={
                !address || !isValidAddress || !tokenInfo || isDuplicated
              }
            >
              Next
            </Button>
          </form>
        )}

        {page === "confirm" && (
          <form onSubmit={onConfirm}>
            <div
              css={css`
                padding: 16px 27px;
                .${MOBILE_SCREEN_CLASS} & {
                  padding: 15px 13px;
                }
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                margin-bottom: 20px;
              `}
            >
              <div
                css={css`
                  width: 32px;
                  height: 32px;
                  position: relative;
                  border-radius: 50%;
                  background-image: url(${iconDefaultToken});
                  background-size: contain;
                  background-repeat: no-repeat;
                  background-position: center;
                `}
              />
              <div
                css={css`
                  flex: 1;
                `}
              >
                <Typography
                  size={16}
                  weight={700}
                  css={css`
                    margin-bottom: 3px;
                    line-height: 1;
                  `}
                >
                  {tokenInfo?.symbol}
                </Typography>
                <Typography
                  size={12}
                  weight={400}
                  css={css`
                    opacity: 0.5;
                    line-height: 1;
                  `}
                >
                  {tokenInfo?.name}
                </Typography>
              </div>
              <div>
                <Typography size={16} weight={700}>
                  {formatNumber(
                    cutDecimal(
                      amountToValue(balance || 0, tokenInfo?.decimals) || 0,
                      DISPLAY_DECIMAL,
                    ),
                  )}
                </Typography>
              </div>
            </div>
            <Button variant="primary" block size="large" type="submit">
              Import
            </Button>
          </form>
        )}
      </div>
      <Button
        variant="secondary"
        block
        size="large"
        onClick={modalProps.onRequestClose}
      >
        Cancel
      </Button>
    </Modal>
  );
}

export default ImportAssetModal;
