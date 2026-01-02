import { css } from "@emotion/react";
import { useQuery } from "@tanstack/react-query";
import { AccAddress, Numeric } from "@xpla/xpla.js";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useCallback, useEffect, useMemo } from "react";
import { useScreenClass } from "react-grid-system";
import { useParams, useSearchParams } from "react-router-dom";

import iconLink from "~/assets/icons/icon-link.svg";

import Button from "~/components/Button";
import Expand from "~/components/Expanded";
import IconButton from "~/components/IconButton";
import InfoTable from "~/components/InfoTable";
import Modal from "~/components/Modal";
import Typography from "~/components/Typography";

import { LP_DECIMALS } from "~/constants/dezswap";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "~/constants/layout";
import { XPLA_SYMBOL } from "~/constants/network";

import useInvalidPathModal from "~/hooks/modals/useInvalidPathModal";
import useAPI from "~/hooks/useAPI";
import useAssets from "~/hooks/useAssets";
import { useConnectedWallet } from "~/hooks/useConnectedWallet";
import useFee from "~/hooks/useFee";
import useLockdropEvents from "~/hooks/useLockdropEvents";
import { useNavigate } from "~/hooks/useNavigate";
import useNetwork from "~/hooks/useNetwork";
import usePairs from "~/hooks/usePairs";
import useRequestPost from "~/hooks/useRequestPost";

import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatNumber,
  getTokenLink,
} from "~/utils";
import { generateUnstakeLockdropMsg } from "~/utils/dezswap";
import { getXplaFeeAmount } from "~/utils/fee";

import InputGroup from "../Stake/InputGroup";

function UnlockPage() {
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { eventAddress } = useParams<{ eventAddress?: string }>();
  const [searchParams] = useSearchParams();
  const {
    selectedChain: { chainId, explorers },
  } = useNetwork();
  const { walletAddress } = useConnectedWallet() ?? {};
  const { getLockdropEventInfo } = useLockdropEvents();
  const api = useAPI();

  const { findPairByLpAddress } = usePairs();
  const { getAsset } = useAssets();

  const { data: lockdropEventInfo, error: lockdropEventInfoError } = useQuery({
    queryKey: ["lockdropEventInfo", eventAddress, chainId],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await getLockdropEventInfo(eventAddress);
      return res;
    },
  });

  const { data: lockdropUserInfo, error: lockdropUserInfoError } = useQuery({
    queryKey: ["lockdropUserInfo", eventAddress, chainId],
    queryFn: async () => {
      if (!eventAddress) {
        return null;
      }
      const res = await api.getLockdropUserInfo(eventAddress);
      return res || null;
    },
  });

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

  const duration = useMemo(() => {
    const value = searchParams.get("duration");
    return value ? Number(value) : undefined;
  }, [searchParams]);

  const lockupInfo = useMemo(() => {
    return lockdropUserInfo?.lockup_infos.find(
      (item) => item.duration === duration,
    );
  }, [duration, lockdropUserInfo]);

  const txOptions = useMemo<MsgExecuteContract[] | undefined>(() => {
    if (!walletAddress || !eventAddress || !duration) {
      return undefined;
    }
    return [
      generateUnstakeLockdropMsg({
        senderAddress: walletAddress,
        contractAddress: eventAddress,
        duration,
      }),
    ];
  }, [walletAddress, duration, eventAddress]);

  const { fee } = useFee(txOptions);
  const feeAmount = useMemo(() => getXplaFeeAmount(fee), [fee]);

  const handleModalClose = useCallback(() => {
    navigate("../..", { relative: "route" });
  }, [navigate]);

  const invalidPathModal = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const { requestPost } = useRequestPost(handleModalClose);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (!txOptions || !fee) {
        return;
      }
      requestPost({
        txOptions: { msgs: txOptions },
        fee,
        skipConfirmation: true,
      });
    },
    [fee, requestPost, txOptions],
  );

  useEffect(() => {
    if (
      !AccAddress.validate(eventAddress || "") ||
      lockdropEventInfoError ||
      lockdropUserInfoError ||
      (!lockdropEventInfoError &&
        !lockdropUserInfo &&
        lockdropUserInfo &&
        !lockupInfo) ||
      (lockupInfo &&
        (lockupInfo.unlock_second * 1000 > Date.now() ||
          Numeric.parse(lockupInfo?.locked_lp_token).lte(0)))
    ) {
      invalidPathModal.open();
    }
  }, [
    eventAddress,
    invalidPathModal,
    lockdropEventInfoError,
    lockdropUserInfo,
    lockdropUserInfoError,
    lockupInfo,
  ]);

  return (
    <Modal
      id="unlock-modal"
      className="modal-parent"
      isOpen={!!lockdropEventInfo}
      title="Unlock LP"
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
          readOnly
          value={amountToValue(lockupInfo?.locked_lp_token || "0", LP_DECIMALS)}
        />
        <div
          css={css`
            padding-bottom: 10px;
          `}
        >
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
                    value: (
                      <span>
                        {ellipsisCenter(lockdropEventInfo?.lp_token_addr, 6)}
                        &nbsp;
                        <a
                          href={getTokenLink(
                            lockdropEventInfo?.lp_token_addr,
                            explorers?.[0].url,
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
                ]}
              />
            </div>
          </Expand>
        </div>
        <Button
          type="submit"
          size="large"
          block
          variant="primary"
          disabled={!fee || !txOptions}
        >
          Unlock
        </Button>
        <Button
          size="large"
          block
          variant="secondary"
          onClick={() => handleModalClose()}
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
}

export default UnlockPage;
