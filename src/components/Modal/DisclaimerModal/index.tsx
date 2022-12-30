import Modal from "components/Modal";
import Typography from "components/Typography";
import { useSetAtom } from "jotai";
import disclaimerLastSeenAtom from "stores/disclaimer";
import { useState } from "react";
import ReactModal from "react-modal";
import { css, useTheme } from "@emotion/react";
import Checkbox from "components/Checkbox";
import Button from "components/Button";
import Box from "components/Box";
import { Col, Row } from "react-grid-system";

function DisclaimerModal({ isOpen }: ReactModal.Props) {
  const setDisclaimerLastSeen = useSetAtom(disclaimerLastSeenAtom);
  const [agreed, setAgreed] = useState(false);
  const theme = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      title="Disclaimer"
      hasCloseButton={false}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <Box
        css={css`
          border: 3px solid ${theme.colors.primary};
          height: 200px;
          overflow-y: auto;
          &::-webkit-scrollbar-track {
            margin: 5px;
          }
        `}
      >
        <Typography color={theme.colors.primary} size={16} weight="normal">
          Dezswap is a decentralized exchange on XPLA chain. Trading and
          providing liquidity on Dezswap is at your own risk, without warranties
          of any kind. Please read the&nbsp;
          <a
            href="https://docs.dezswap.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 700 }}
          >
            document
          </a>
          &nbsp;carefully and understand how Dezswap works before using it.
          <br />
          <br />I acknowledge and agree that I am responsible for various losses
          of assets by making transactions on Dezswap, including swap, liquidity
          provision/withdrawal, etc. The entities involved in this site are not
          liable for any damages resulting from my use of Dezswap.
        </Typography>
      </Box>
      <div
        css={css`
          margin: 20px 0px;
        `}
      >
        <Checkbox
          checked={agreed}
          onClick={(e) => setAgreed(!!(e?.target as HTMLInputElement)?.checked)}
        >
          <Typography color={theme.colors.primary} size={16} weight="normal">
            I understand the risks and would like to proceed
          </Typography>
        </Checkbox>
      </div>
      <Row direction="column">
        <Col style={{ flex: "unset", paddingBottom: "10px" }}>
          <Button
            disabled={!agreed}
            variant="primary"
            type="submit"
            size="large"
            block
            onClick={() => {
              setDisclaimerLastSeen(new Date());
            }}
          >
            Agree and continue
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

export default DisclaimerModal;
