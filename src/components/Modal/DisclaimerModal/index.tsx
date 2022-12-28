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
          By participating in the staking of LP Token (“Staking Program”), each
          participating individual and organization (“Participant“) accepts and
          agrees that, to the extent permitted by law, C2X disclaims all
          liability, damages, cost, loss or expense (including, without
          limitation, legal fees, costs and expenses) to it in respect of its
          involvement in the Staking Program. If participants do not accept any
          of the following factors, they should not be taking part in the
          Staking Program * You are required to set the lock-up period when
          staking LP tokens, and it cannot be withdrawn or changed until the
          lock-up period ends. ** The minimum lock-up period is 4 weeks. You may
          also lock your tokens for up to 52 weeks. *** You will be
          automatically admitted to the staking program if you stake your LP
          Tokens during the staking program period. **** Transaction fees of
          $LUNA or $UST will occur during the staking process.
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
            By participating in the staking of LP Token (“Staking Program”),
            each participating individual
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
