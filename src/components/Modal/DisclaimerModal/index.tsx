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
        <Typography color={theme.colors.primary} size={16} weight="400">
          Dezswap is a decentralized exchange on the XPLA Chain. Trading and
          providing liquidity on Dezswap is at your own risk, without warranties
          of any kind.
          <br />
          <br />
          These terms constitute the entire agreement between you and us with
          respect to the subject matter hereof. This Agreement supersedes any
          and all prior or contemporaneous written and oral agreements,
          communications and other understandings (if any) relating to the
          subject matter of the terms.
          <br />
          <br />
          &nbsp;You agree not to engage in, or attempt to engage in, any of the
          following categories of prohibited activity including any unlawful
          conduct in relation to your access and use of the Interface:
          cyberattack, market manipulation(e.g. the manipulative tactics
          commonly known as “rug pulls”), sale of Stolen Property.
          <br />
          <br />
          &nbsp;You understand and acknowledge that we do not broker trading
          orders on your behalf nor do we collect or earn fees from your trades
          on the Interface. We also do not facilitate the execution or
          settlement of your trades, which occur entirely on the XPLA Chain. As
          a result, we do not (and cannot) guarantee market best pricing or best
          execution through the Interface or when using our Auto Routing
          feature, which routes trades across liquidity pools on the Protocol
          only. Any references in the Interface to “best price” do not
          constitute a representation or warranty about pricing available
          through the Interface, on the Protocol, or elsewhere.
          <br />
          <br />
          &nbsp;You agree and understand that:
          <br />
          a. all trades you submit through the Interface are considered
          unsolicited, which means that they are solely initiated by you
          <br />
          b. you have not received any investment advice from us in connection
          with any trades, including those you place via our Auto Routing API
          <br />
          c. we do not conduct a suitability review of any trades you submit.
          <br />
          We may provide information about tokens in the Interface sourced from
          third-party data partners through features such as rarity scores,
          token explorer or token lists (which includes Dezswap default token
          list and a list hosted at assets.xpla.io). We may also provide
          verified labels for certain tokens. The provision of informational
          materials does not make trades in those tokens solicited; we are not
          attempting to induce you to make any purchase as a result of
          information provided. All such information provided by the Interface
          is for informational purposes only and should not be construed as
          investment advice or a recommendation that a particular token is a
          safe or sound investment. You should not take, or refrain from taking,
          any action based on any information contained in the Interface. By
          providing token information for your convenience, we do not make any
          investment recommendations to you or opine on the merits of any
          transaction or opportunity. You alone are responsible for determining
          whether any investment, investment strategy or related transaction is
          appropriate for you based on your personal investment objectives,
          financial circumstances, and risk tolerance.
          <br />
          <br />
          &nbsp;The Interface is a purely non-custodial application, meaning we
          do not ever have custody, possession, or control of your digital
          assets at any time. It further means you are solely responsible for
          the custody of the cryptographic private keys to the digital asset
          wallets you hold and you should never share your wallet credentials or
          seed phrase with anyone. We accept no responsibility for, or liability
          to you, in connection with your use of a wallet and make no
          representations or warranties regarding how the Interface will operate
          with any specific wallet. Likewise, you are solely responsible for any
          associated wallet and we are not liable for any acts or omissions by
          you in connection with or as a result of your wallet being
          compromised. This Agreement is not intended to, and does not, create
          or impose any fiduciary duties on us. To the fullest extent permitted
          by law, you acknowledge and agree that we owe no fiduciary duties or
          liabilities to you or any other party, and that to the extent any such
          duties or liabilities may exist at law or in equity, those duties and
          liabilities are hereby irrevocably disclaimed, waived, and eliminated.
          You further agree that the only duties and obligations that we owe you
          are those set out expressly in this Agreement.
          <br />
          <br />
          &nbsp;The Interface may not be available or appropriate for use in
          your jurisdiction. By accessing or using the Interface, you agree that
          you are solely and entirely responsible for compliance with all laws
          and regulations that may apply to you. Specifically, your use of the
          Interface or the Protocol may result in various tax consequences, such
          as income or capital gains tax, value-added tax, goods and services
          tax, or sales tax in certain jurisdictions. It is your responsibility
          to determine whether taxes apply to any transactions you initiate or
          receive and, if so, to report and/or remit the correct tax to the
          appropriate tax authority.
          <br />
          <br />
          &nbsp;By accessing and using the Interface, you represent that you are
          financially and technically sophisticated enough to understand the
          inherent risks associated with using cryptographic and
          blockchain-based systems, and that you have a working knowledge of the
          usage and intricacies of digital assets such as XPLA, so-called
          stablecoins, and other digital tokens such as those following the
          Cosmwasm Token Spec (CW-20). In particular, you understand that the
          markets for these digital assets are nascent and highly volatile due
          to risk factors including (but not limited to) adoption, speculation,
          technology, security, and regulation. You understand that anyone can
          create a token, including fake versions of existing tokens and tokens
          that falsely claim to represent projects, and acknowledge and accept
          the risk that you may mistakenly trade those or other tokens.
          So-called stablecoins may not be as stable as they purport to be, may
          not be fully or adequately collateralized, and may be subject to
          panics and runs. Further, you understand that smart contract
          transactions automatically execute and settle, and that
          blockchain-based transactions are irreversible when confirmed. You
          acknowledge and accept that the cost and speed of transacting with
          cryptographic and blockchain-based systems such as XPLA Chain are
          variable and may increase dramatically at any time. You further
          acknowledge and accept the risk of selecting to trade in Expert Modes,
          which can expose you to potentially significant price slippage and
          higher costs. If you act as a liquidity provider to the Protocol
          through the Interface, you understand that your digital assets may
          lose some or all of their value while they are supplied to the
          Protocol through the Interface due to the fluctuation of prices of
          tokens in a trading pair or liquidity pool. In summary, you
          acknowledge that we are not responsible for any of these variables or
          risks, do not own or control the Protocol, and cannot be held liable
          for any resulting losses that you experience while accessing or using
          the Interface. Accordingly, you understand and agree to assume full
          responsibility for all of the risks of accessing and using the
          Interface to interact with the Protocol.
          <br />
          <br />
          &nbsp;The Interface may contain references or links to third-party
          resources, including (but not limited to) information, materials,
          products, or services, that we do not own or control. In addition,
          third parties may offer promotions related to your access and use of
          the Interface. We do not approve, monitor, endorse, warrant or assume
          any responsibility for any such resources or promotions. If you access
          any such resources or participate in any such promotions, you do so at
          your own risk, and you understand that this Agreement does not apply
          to your dealings or relationships with any third parties. You
          expressly relieve us of any and all liability arising from your use of
          any such resources or participation in any such promotions.
          <br />
          <br />
          &nbsp;You expressly agree that you assume all risks in connection with
          your access and use of the Interface. You further expressly waive and
          release us from any and all liability, claims, causes of action, or
          damages arising from or in any way relating to your use of the
          Interface.
          <br />
          <br />
          &nbsp;You agree to hold harmless, release, defend, and indemnify us
          and our officers, directors, employees, contractors, agents,
          affiliates, and subsidiaries from and against all claims, damages,
          obligations, losses, liabilities, costs, and expenses arising from:
          (a) your access and use of the Interface; (b) your violation of any
          term or condition of this Agreement, the right of any third party, or
          any other applicable law, rule, or regulation; and (c) any other
          party&apos;s access and use of the Interface with your assistance or
          using any device or account that you own or control.
          <br />
          <br />
          &nbsp;The Interface is provided on an &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; basis. TO THE FULLEST EXTENT PERMITTED BY LAW, WE
          DISCLAIM ANY REPRESENTATIONS AND WARRANTIES OF ANY KIND, WHETHER
          EXPRESS, IMPLIED, OR STATUTORY, INCLUDING (BUT NOT LIMITED TO) THE
          WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          You acknowledge and agree that your use of the Interface is at your
          own risk. We do not represent or warrant that access to the Interface
          will be continuous, uninterrupted, timely, or secure; that the
          information contained in the Interface will be accurate, reliable,
          complete, or current; or that the Interface will be free from errors,
          defects, viruses, or other harmful elements. No advice, information,
          or statement that we make should be treated as creating any warranty
          concerning the Interface. We do not endorse, guarantee, or assume
          responsibility for any advertisements, offers, or statements made by
          third parties concerning the Interface.
          <br />
          <br />
          &nbsp;UNDER NO CIRCUMSTANCES SHALL WE OR ANY OF OUR OFFICERS,
          DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, AFFILIATES, OR SUBSIDIARIES
          BE LIABLE TO YOU FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING (BUT NOT LIMITED TO)
          DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE
          PROPERTY, ARISING OUT OF OR RELATING TO ANY ACCESS OR USE OF THE
          INTERFACE, NOR WILL WE BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY
          RESULTING FROM HACKING, TAMPERING, OR OTHER UNAUTHORIZED ACCESS OR USE
          OF THE INTERFACE OR THE INFORMATION CONTAINED WITHIN IT. WE ASSUME NO
          LIABILITY OR RESPONSIBILITY FOR ANY: (A) ERRORS, MISTAKES, OR
          INACCURACIES OF CONTENT; (B) PERSONAL INJURY OR PROPERTY DAMAGE, OF
          ANY NATURE WHATSOEVER, RESULTING FROM ANY ACCESS OR USE OF THE
          INTERFACE; (C) UNAUTHORIZED ACCESS OR USE OF ANY SECURE SERVER OR
          DATABASE IN OUR CONTROL, OR THE USE OF ANY INFORMATION OR DATA STORED
          THEREIN; (D) INTERRUPTION OR CESSATION OF FUNCTION RELATED TO THE
          INTERFACE; (E) BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT MAY BE
          TRANSMITTED TO OR THROUGH THE INTERFACE; (F) ERRORS OR OMISSIONS IN,
          OR LOSS OR DAMAGE INCURRED AS A RESULT OF THE USE OF, ANY CONTENT MADE
          AVAILABLE THROUGH THE INTERFACE; AND (G) THE DEFAMATORY, OFFENSIVE, OR
          ILLEGAL CONDUCT OF ANY THIRD PARTY.
          <br />
          <br />
          &nbsp;Blockchain transactions require the payment of transaction fees
          to the XPLA Chain. You will be responsible for paying the Gas Fees for
          any transaction.
          <br />
          <br />
          &nbsp;This app uses Google Analytics API and the app logs anonymized
          usage statistics in order to improve over time.
          <br />
          <br />
          <a
            href="https://docs.dezswap.io/"
            target="_blank"
            rel="noopener noreferrer"
            css={css`
              text-decoration: none;
            `}
          >
            <Typography
              size={16}
              weight="bold"
              color={theme.colors.link}
              css={css`
                text-decoration: underline;
                text-underline-offset: 3px;
                word-break: break-all;
                text-align: center;
              `}
            >
              Learn more
            </Typography>
          </a>
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
            I acknowledge and agree Dezswap terms described above.
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
