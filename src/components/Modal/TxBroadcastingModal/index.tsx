import { css, useTheme } from "@emotion/react";

import BroadcastingSvg from "assets/images/broadcasting.svg";
import Success from "assets/images/success.svg";
import Failed from "assets/images/failed.svg";
import iconLink from "assets/icons/icon-link.svg";

import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { ellipsisCenter, getTransactionLink } from "utils";
import { TxInfo } from "@xpla/xpla.js";
import { TxError } from "types/common";
import { useLCDClient } from "hooks/useLCDClient";
import Panel from "components/Panel";
import Modal from "components/Modal";
import { useNetwork } from "hooks/useNetwork";
import Typography from "components/Typography";
import { Col, Row, useScreenClass } from "react-grid-system";
import IconButton from "components/IconButton";
import Hr from "components/Hr";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";

interface TxBroadcastingModalProps {
  txHash?: string;
  txError?: TxError;
  onDoneClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryClick?: MouseEventHandler<HTMLButtonElement>;
}

function TxBroadcastingModal({
  txHash,
  txError,
  isOpen,
  onDoneClick,
  onRetryClick,
  ...modalProps
}: ReactModal.Props & TxBroadcastingModalProps) {
  const network = useNetwork();
  const lcd = useLCDClient();
  const theme = useTheme();
  const screenClass = useScreenClass();

  const [timeAfterQueued, setTimeAfterQueued] = useState(0);

  const [txInfo, setTxInfo] = useState<TxInfo>();

  useEffect(() => {
    const fetchTxInfo = async () => {
      if (txHash) {
        const res = await lcd.tx.txInfo(txHash);
        setTxInfo(res);
      }
    };

    const intervalId = !txInfo
      ? setInterval(() => {
          setTimeAfterQueued((current) => current + 1);
          fetchTxInfo();
        }, 1000)
      : undefined;

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [lcd, txHash, txInfo]);

  useEffect(() => {
    setTimeAfterQueued(0);
  }, [txHash, lcd]);

  const modalTitle = useMemo(() => {
    if (!txHash && !txError) {
      return "Check your wallet";
    }
    if (!txInfo && txHash) {
      return "Broadcasting transaction";
    }
    if (txInfo && txHash && !txInfo?.code) {
      return "Complete";
    }
    if (txError || txInfo?.code) {
      return "Something wrong";
    }
    return undefined;
  }, [txError, txHash, txInfo]);

  return (
    <Modal
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      isOpen={isOpen}
      title={modalTitle}
      error={!!(txError || txInfo?.code)}
      {...(!(!txHash && !txError) ? modalProps : {})}
    >
      {!txHash && !txError && (
        <div
          css={css`
            text-align: center;
          `}
        >
          <object
            type="image/svg+xml"
            data={BroadcastingSvg}
            style={{ height: "170px", margin: "-10px 0px" }}
          >
            broadcasting
          </object>
          <Panel
            border
            css={css`
              padding: 16px;
              background-color: ${theme.colors.text.background};
            `}
          >
            <Typography
              size={14}
              color="primary"
              weight={700}
              css={css`
                margin-bottom: 9px;
              `}
            >
              Wallet sign-in is needed
            </Typography>
            <Hr
              css={css`
                margin-bottom: 10px;
              `}
            />
            <Typography size={16} color="primary" weight={400}>
              Go to the connected wallet and sign-in to proceed with the
              transaction
            </Typography>
          </Panel>
        </div>
      )}

      {!txInfo && !!txHash && (
        <div
          css={css`
            text-align: center;
          `}
        >
          <object
            type="image/svg+xml"
            data={BroadcastingSvg}
            style={{ height: "170px", margin: "-10px 0px" }}
          >
            broadcasting
          </object>
          <Panel
            border
            css={css`
              padding: 16px;
              background-color: ${theme.colors.text.background};
            `}
          >
            <Row style={{ paddingBottom: "10px" }}>
              <Col width="auto">
                <Typography>Queued</Typography>
              </Col>
              <Col style={{ textAlign: "right" }}>
                <Typography size={16} weight="bold">
                  {`00${Number(timeAfterQueued / 60).toFixed(0)}`.slice(-2)}:
                  {`0${timeAfterQueued % 60}`.slice(-2)}
                </Typography>
              </Col>
            </Row>
            <Row
              direction="row"
              wrap="nowrap"
              style={{ justifyContent: "space-between" }}
            >
              <Col width="auto" style={{ flexShrink: "0" }}>
                <Typography>Tx Hash</Typography>
              </Col>
              <Col>
                <a
                  href={getTransactionLink(txHash, network.name)}
                  target="_blank"
                  rel="noreferrer"
                  css={css`
                    text-decoration: none;
                  `}
                >
                  <Row
                    gutterWidth={10}
                    align="end"
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Col>
                      <Typography
                        size={16}
                        weight="bold"
                        color={theme.colors.link}
                        css={css`
                          text-decoration: underline;
                          text-underline-offset: 3px;
                          word-break: break-all;
                          text-align: right;
                        `}
                      >
                        {ellipsisCenter(txHash, 10)}
                      </Typography>
                    </Col>
                    <Col width="auto" style={{ flexShrink: "0" }}>
                      <IconButton size={24} icons={{ default: iconLink }} />
                    </Col>
                  </Row>
                </a>
              </Col>
            </Row>
          </Panel>
        </div>
      )}

      {!!txInfo &&
        !!txHash &&
        !txInfo?.code && ( // txInfo.code must be 0 when success
          <div
            css={css`
              text-align: center;
            `}
          >
            <object
              type="image/svg+xml"
              data={Success}
              style={{ height: "170px", margin: "-10px 0px" }}
            >
              broadcasting
            </object>
            <Panel
              border
              css={css`
                padding: 16px;
                background-color: ${theme.colors.text.background};
              `}
            >
              <Row wrap="nowrap" style={{ justifyContent: "space-between" }}>
                <Col width="auto" style={{ flexShrink: "0" }}>
                  <Typography>Tx Hash</Typography>
                </Col>
                <Col width="auto">
                  <a
                    href={getTransactionLink(txHash, network.name)}
                    target="_blank"
                    rel="noreferrer"
                    css={css`
                      text-decoration: none;
                    `}
                  >
                    <Row
                      gutterWidth={10}
                      align="end"
                      style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Col>
                        <Typography
                          size={16}
                          weight="bold"
                          color={theme.colors.link}
                          css={css`
                            text-decoration: underline;
                            text-underline-offset: 3px;
                            word-break: break-all;
                            text-align: right;
                          `}
                        >
                          {ellipsisCenter(txHash, 10)}
                        </Typography>
                      </Col>
                      <Col width="auto">
                        <IconButton size={24} icons={{ default: iconLink }} />
                      </Col>
                    </Row>
                  </a>
                </Col>
              </Row>
            </Panel>
            <Button
              size="large"
              variant="primary"
              css={css`
                width: 100%;
                margin-top: 20px;
              `}
              onClick={onDoneClick}
            >
              Done
            </Button>
          </div>
        )}

      {(!!txError || !!txInfo?.code) && (
        <div
          css={css`
            text-align: center;
          `}
        >
          <object
            type="image/svg+xml"
            data={Failed}
            style={{ height: "170px", margin: "-10px 0px" }}
          >
            broadcasting
          </object>
          <Panel
            border
            css={css`
              padding: 16px;
              background-color: ${theme.colors.text.background};
              border-color: ${theme.colors.danger};
            `}
          >
            <Typography
              color={theme.colors.danger}
              weight="bold"
              css={css`
                padding-bottom: 10px;
              `}
            >
              The transaction failed. Please check the message below.
            </Typography>
            <Hr color="danger" size={1} />
            <Typography
              size={16}
              color={theme.colors.danger}
              weight="normal"
              css={css`
                padding-top: 10px;
              `}
            >
              {txInfo?.raw_log ?? txError?.message}
            </Typography>
          </Panel>
          <Button
            size="large"
            variant="error"
            css={css`
              width: 100%;
              margin-top: 20px;
            `}
            onClick={onDoneClick}
          >
            Return
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default TxBroadcastingModal;
