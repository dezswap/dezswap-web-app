import { css, useTheme } from "@emotion/react";

import BroadcastingSvg from "assets/images/broadcasting.svg";
import Success from "assets/images/success.svg";
import Failed from "assets/images/failed.svg";
import iconLink from "assets/icons/icon-link.svg";

import { MouseEventHandler, useEffect, useState } from "react";
import { ellipsisCenter, getTransactionLink } from "utils";
import { TxInfo } from "@xpla/xpla.js";
import { TxError } from "types/common";
import { useLCDClient } from "@xpla/wallet-provider";
import Panel from "components/Panel";
import Modal from "components/Modal";
import { useNetwork } from "hooks/useNetwork";
import Typography from "components/Typography";
import { Col, Row } from "react-grid-system";
import IconButton from "components/IconButton";

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

  return (
    <>
      {!txInfo && txHash && (
        <Modal isOpen={isOpen} title="Broadcasting transaction" {...modalProps}>
          <div
            css={css`
              text-align: center;
            `}
          >
            <object
              type="image/svg+xml"
              data={BroadcastingSvg}
              style={{ height: "166px", margin: "-10px 0px" }}
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
              <Row style={{ justifyContent: "space-between" }}>
                <Col width="auto">
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
                            border-bottom: 1px solid ${theme.colors.link};
                            padding-bottom: 0px;
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
          </div>
        </Modal>
      )}
      {txInfo && txHash && (
        <Modal isOpen={isOpen} title="Complete" {...modalProps}>
          <div
            css={css`
              text-align: center;
            `}
          >
            <object
              type="image/svg+xml"
              data={Success}
              style={{ width: "450px", margin: "-20px 0px" }}
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
              <Row style={{ justifyContent: "space-between" }}>
                <Col width="auto">
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
                            border-bottom: 1px solid ${theme.colors.link};
                            padding-bottom: 0px;
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
          </div>
        </Modal>
      )}
      {txError && (
        <Modal error isOpen={isOpen} title="Something wrong" {...modalProps}>
          <div
            css={css`
              text-align: center;
            `}
          >
            <object
              type="image/svg+xml"
              data={Failed}
              style={{ width: "450px", margin: "-20px 0px" }}
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
              <Typography size={16} color={theme.colors.danger} weight="normal">
                User denied
              </Typography>
            </Panel>
          </div>
        </Modal>
      )}
    </>
  );
}

export default TxBroadcastingModal;
