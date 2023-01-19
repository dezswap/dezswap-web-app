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
import Hr from "components/Hr";
import styled from "@emotion/styled";
import colors from "styles/theme/colors";

const Content = styled(Typography)`
  font-weight: 400;
  font-size: 16px;
  color: ${colors.primary};
`;

const BoldContent = styled(Typography)`
  font-weight: bold;
  font-size: 16px;
  color: ${colors.primary};
`;

const ItalicContent = styled(Typography)`
  font-size: 16px;
  font-style: italic;
  color: ${colors.primary};
`;

const B = styled.span`
  font-weight: bold;
`;

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
        <BoldContent>
          Dezswap is a decentralized exchange on the XPLA Chain. Trading and
          providing liquidity on Dezswap is at your own risk, without warranties
          of any kind.
        </BoldContent>
        <Hr
          css={css`
            margin: 10px 0px;
          `}
        />
        <Content>
          These Terms of Service (the “Agreement”) explain the terms and
          conditions by which you may access and use https://app.dezswap.io, a
          website-hosted user interface (the “Interface” or “App”) provided by
          DELIGHT LABS (“we”, “our”, or “us”). You must read this Agreement
          carefully as it governs your use of the Interface. By accessing or
          using the Interface, you signify that you have read, understand, and
          agree to be bound by this Agreement in its entirety. If you do not
          agree, you are not authorized to access or use the Interface and
          should not use the Interface.
          <br />
          <br />
        </Content>
        <BoldContent>
          NOTICE: This Agreement contains important information, including a
          binding arbitration provision and a class action waiver, both of which
          impact your rights as to how disputes are resolved. The Interface is
          only available to you — and you should only access the Interface — if
          you agree completely with these terms.
          <br />
          <br />
          Introduction
        </BoldContent>
        <Content>
          The Interface provides access to a decentralized protocol on the XPLA
          Chain, that allows users to trade certain compatible digital assets
          (“the Dezswap protocol” or the “Protocol”). The Interface is one, but
          not the exclusive, means of accessing the Protocol.
          <br /> To access the Interface, you must use non-custodial wallet
          software, which allows you to interact with the XPLA Chain. Your
          relationship with that non-custodial wallet provider is governed by
          the applicable terms of service of that third party, not this
          Agreement. Wallets are not operated by, maintained by, or affiliated
          with us, and we do not have custody or control over the contents of
          your wallet and have no ability to retrieve or transfer its contents.
          By connecting your wallet to our Interface, you agree to be bound by
          this Agreement and all of the terms incorporated herein by reference.
          <br />
          <br />
        </Content>
        <BoldContent>Modification of this Agreement</BoldContent>
        <Content>
          We reserve the right, in our sole discretion, to modify this Agreement
          from time to time. If we make any material modifications, we will
          notify you by updating the date at the top of the Agreement and by
          maintaining a current version of the Agreement at
          https://docs.dezswap.io/docs/terms-of-service. All modifications will
          be effective when they are posted, and your continued accessing or use
          of the Interface will serve as confirmation of your acceptance of
          those modifications. If you do not agree with any modifications to
          this Agreement, you must immediately stop accessing and using the
          Interface.
          <br />
          <br />
        </Content>
        <BoldContent>
          Description of Services provided through the Interface
        </BoldContent>
        <Content>
          The Interface provides a web or mobile-based means of accessing the
          Protocol.
          <br /> The Interface is distinct from the Protocol and is one, but not
          the exclusive, means of accessing the Protocol. The Protocol itself
          comprises open-source or source-available self-executing smart
          contracts that are deployed on the XPLA Chain. We do not control or
          operate the Protocol on the XPLA Chain. By using the Interface, you
          understand that you are not buying or selling digital assets from us
          and that we do not operate any liquidity pools on the Protocol or
          control trade execution on the Protocol. When traders pay fees for
          trades, those fees accrue to liquidity providers for the Protocol. As
          a general matter, we are not a liquidity provider into Protocol
          liquidity pools and liquidity providers are independent third parties.
          The Protocol was deployed on the XPLA Chain. Please note that digital
          assets that have been “bridged” or “wrapped” to operate on other
          blockchain networks are distinct from the original XPLA mainnet asset.
          <br />
          <br />
        </Content>
        <BoldContent>Intellectual Property Rights</BoldContent>
        <Content>
          We own all intellectual property and other rights in the Interface and
          its contents, including (but not limited to) software, text, images,
          trademarks, service marks, copyrights, patents, designs, and its “look
          and feel.” This intellectual property is available under the terms of
          our copyright licenses and our Trademark Guidelines. Unlike the
          Interface, the Protocol is comprised entirely of open-source or
          source-available software running on the XPLA Chain.
          <br />
          <br />
        </Content>
        <BoldContent>Additional Rights</BoldContent>
        <Content>
          We reserve the following rights, which do not constitute obligations
          of ours:
          <br /> (a) with or without notice to you, to modify, substitute,
          eliminate or add to the Interface; (b) to review, modify, filter,
          disable, delete and remove any and all content and information from
          the Interface; and (c) to cooperate with any law enforcement, court or
          government investigation or order or third party requesting or
          directing that we disclose information or content or information that
          you provide.
          <br />
          <br />
        </Content>
        <BoldContent>Prohibited Activity</BoldContent>
        <Content>
          You agree not to engage in, or attempt to engage in, any of the
          following categories of prohibited activity in relation to your access
          and use of the Interface:
        </Content>

        <Content>
          This app uses Google Analytics API and the app logs anonymized usage
          statistics in order to improve over time.
          <br />
          <br />
          Intellectual Property Infringement. Activity that infringes on or
          violates any copyright, trademark, service mark, patent, right of
          publicity, right of privacy, or other proprietary or intellectual
          property rights under the law.
          <br /> Cyberattack. Activity that seeks to interfere with or
          compromise the integrity, security, or proper functioning of any
          computer, server, network, personal device, or other information
          technology system, including (but not limited to) the deployment of
          viruses and denial of service attacks.
          <br /> Fraud and Misrepresentation. Activity that seeks to defraud us
          or any other person or entity, including (but not limited to)
          providing any false, inaccurate, or misleading information in order to
          unlawfully obtain the property of another.
          <br /> Market Manipulation. Activity that violates any applicable law,
          rule, or regulation concerning the integrity of trading markets,
          including (but not limited to) the manipulative tactics commonly known
          as “rug pulls”, pumping and dumping, and wash trading.
          <br />
          <br />
          Sale of Stolen Property. Buying, selling, or transferring of stolen
          items, fraudulently obtained items, items taken without authorization,
          and/or any other illegally obtained items.
          <br /> Data Mining or Scraping. Activity that involves data mining,
          robots, scraping, or similar data gathering or extraction methods of
          content or information from the Interface.
          <br /> Objectionable Content. Activity that involves soliciting
          information from anyone under the age of 18 or that is otherwise
          harmful, threatening, abusive, harassing, tortious, excessively
          violent, defamatory, vulgar, obscene, pornographic, libelous, invasive
          of another’s privacy, hateful, discriminatory, or otherwise
          objectionable.
          <br />
          <br />
        </Content>
        <BoldContent>Not Registered with Any Other Agency</BoldContent>
        <Content>
          You understand and acknowledge that we do not broker trading orders on
          your behalf nor do we collect or earn fees from your trades on the
          Interface. We also do not facilitate the execution or settlement of
          your trades, which occur entirely on the public distributed on public
          distributed blockchain, which is the XPLA Chain. As a result, we do
          not (and cannot) guarantee market best pricing or best execution
          through the Interface or when using our Auto Routing feature, which
          routes trades across liquidity pools on the Protocol only. Any
          references in the Interface to “best price” do not constitute a
          representation or warranty about pricing available through the
          Interface, on the Protocol, or elsewhere.
          <br />
          <br />
        </Content>
        <BoldContent>
          Non-Solicitation; No Investment Advice
          <br />
          You agree and understand that
          <br />
        </BoldContent>
        <Content>
          <B>a.</B> all trades you submit through the Interface are considered
          unsolicited, which means that they are solely initiated by you.
          <br />
          <B>b.</B> you have not received any investment advice from us in
          connection with any trades, including those you place via our Auto
          Routing API.
          <br />
          <B>c.</B> we do not conduct a suitability review of any trades you
          submit.
          <br />
          <br />
          We may provide information about tokens in the Interface sourced from
          third-party data partners through features such as token explorer or
          token lists (which includes the default token list and verified token
          lists hosted at assets.xpla.io/cw20/tokens.json and
          assets.xpla.io/ibc/tokens.json). We may also provide verified labels
          or warning dialogs for certain tokens. The provision of informational
          materials does not make trades in those tokens solicited; we are not
          attempting to induce you to make any purchase as a result of the
          information provided. All such information provided by the Interface
          is for informational purposes only and should not be construed as
          investment advice or a recommendation that a particular token is a
          safe or sound investment. You should not take, or refrain from taking,
          any action based on any information contained in the Interface. By
          providing token information for your convenience, we do not make any
          investment recommendations to you or opine on the merits of any
          transaction or opportunity. You alone are responsible for determining
          whether any investment, investment strategy, or related transaction is
          appropriate for you based on your personal investment objectives,
          financial circumstances, and risk tolerance.
          <br />
          <br />
        </Content>
        <BoldContent>Non-Custodial and No Fiduciary Duties</BoldContent>
        <Content>
          The Interface is a purely non-custodial application, meaning we do not
          ever have custody, possession, or control of your digital assets at
          any time. It further means you are solely responsible for the custody
          of the cryptographic private keys to the digital asset wallets you
          hold and you should never share your wallet credentials or seed phrase
          with anyone. We accept no responsibility for, or liability to you, in
          connection with your use of a wallet and make no representations or
          warranties regarding how the Interface will operate with any specific
          wallet. Likewise, you are solely responsible for any associated wallet
          and we are not liable for any acts or omissions by you in connection
          with or as a result of your wallet being compromised.
          <br /> This Agreement is not intended to, and does not, create or
          impose any fiduciary duties on us. To the fullest extent permitted by
          law, you acknowledge and agree that we owe no fiduciary duties or
          liabilities to you or any other party, and that to the extent any such
          duties or liabilities may exist at law or in equity, those duties and
          liabilities are hereby irrevocably disclaimed, waived, and eliminated.
          You further agree that the only duties and obligations that we owe you
          are those set out expressly in this Agreement.
          <br />
          <br />
        </Content>
        <BoldContent>Compliance and Tax Obligations</BoldContent>
        <Content>
          The Interface may not be available or appropriate for use in your
          jurisdiction. By accessing or using the Interface, you agree that you
          are solely and entirely responsible for compliance with all laws and
          regulations that may apply to you.
          <br /> Specifically, your use of the Interface or the Protocol may
          result in various tax consequences, such as income or capital gains
          tax, value-added tax, goods and services tax, or sales tax in certain
          jurisdictions.
          <br /> It is your responsibility to determine whether taxes apply to
          any transactions you initiate or receive and, if so, to report and/or
          remit the correct tax to the appropriate tax authority.
          <br />
          <br />
        </Content>
        <BoldContent>Assumption of Risk</BoldContent>
        <Content>
          By accessing and using the Interface, you represent that you are
          financially and technically sophisticated enough to understand the
          inherent risks associated with using cryptographic and
          blockchain-based systems including automated market making smart
          contract systems, and that you have a working knowledge of the usage
          and intricacies of digital assets such as XPLA, so-called stablecoins,
          and other digital tokens such as those following the Cosmwasm Token
          Spec (CW-20).
          <br /> In particular, you understand that the markets for these
          digital assets are nascent and highly volatile due to risk factors
          including (but not limited to) adoption, speculation, technology,
          security, and regulation. You understand that anyone can create a
          token, including fake versions of existing tokens and tokens that
          falsely claim to represent projects, and acknowledge and accept the
          risk that you may mistakenly trade those or other tokens. So-called
          stablecoins may not be as stable as they purport to be, may not be
          fully or adequately collateralized, and may be subject to panics and
          runs.
          <br /> Further, you understand that smart contract transactions
          automatically execute and settle, and that blockchain-based
          transactions are irreversible when confirmed. You acknowledge and
          accept that the cost and speed of transacting with cryptographic and
          blockchain-based systems such as XPLA Chain are variable and may
          increase dramatically at any time. You further acknowledge and accept
          the risk of trading with additional parameters' settings (slippage
          tolerance, auto-router, and transaction deadline), which can expose
          you to potentially significant price slippage and higher costs.
          <br /> If you act as a liquidity provider to the Protocol through the
          Interface, you understand that your digital assets may lose some or
          all of their value while they are supplied to the Protocol through the
          Interface due to the fluctuation of prices of tokens in a trading pair
          or liquidity pool.
          <br /> Finally, you understand that we do not make any representation
          or warranty about the safety or soundness of any cross-chain bridge.
          <br /> In summary, you acknowledge that we are not responsible for any
          of these variables or risks, do not own or control the Protocol, and
          cannot be held liable for any resulting losses that you experience
          while accessing or using the Interface. Accordingly, you understand
          and agree to assume full responsibility for all of the risks of
          accessing and using the Interface to interact with the Protocol.
          <br />
          <br />
        </Content>
        <BoldContent>Third-Party Resources and Promotions</BoldContent>
        <Content>
          The Interface may contain references or links to third-party
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
        </Content>
        <BoldContent>Release of Claims</BoldContent>
        <Content>
          You expressly agree that you assume all risks in connection with your
          access and use of the Interface. You further expressly waive and
          release us from any and all liability, claims, causes of action, or
          damages arising from or in any way relating to your use of the
          Interface.
          <br />
          <br />
        </Content>
        <BoldContent>Indemnity</BoldContent>
        <Content>
          You agree to hold harmless, release, defend, and indemnify us and our
          officers, directors, employees, contractors, agents, affiliates, and
          subsidiaries from and against all claims, damages, obligations,
          losses, liabilities, costs, and expenses arising from: <B>(a)</B> your
          access and use of the Interface; <B>(b)</B> your violation of any term
          or condition of this Agreement, the right of any third party, or any
          other applicable law, rule, or regulation; and <B>(c)</B> any other
          party&apos;s access and use of the Interface with your assistance or
          using any device or account that you own or control.
          <br />
          <br />
        </Content>
        <BoldContent>No Warranties</BoldContent>
        <Content>
          The Interface is provided on an &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; basis.{" "}
          <B>
            TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ANY
            REPRESENTATIONS AND WARRANTIES OF ANY KIND, WHETHER EXPRESS,
            IMPLIED, OR STATUTORY, INCLUDING (BUT NOT LIMITED TO) THE WARRANTIES
            OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </B>
          You acknowledge and agree that your use of the Interface is at your
          own risk. We do not represent or warrant that access to the Interface
          will be continuous, uninterrupted, timely, or secure; that the
          information contained in the Interface will be accurate, reliable,
          complete, or current; or that the Interface will be free from errors,
          defects, viruses, or other harmful elements. No advice, information,
          or statement that we make should be treated as creating any warranty
          concerning the Interface. We do not endorse, guarantee, or assume
          responsibility for any advertisements, offers, or statements made by
          third parties concerning the Interface. Similarly, the Protocol is
          provided &quot;AS IS&quot;, at your own risk, and without warranties
          of any kind. No developer or entity involved in creating the Protocol
          will be liable for any claims or damages whatsoever associated with
          your use, inability to use, or your interaction with other users of,
          the Protocol, including any direct, indirect, incidental, special,
          exemplary, punitive or consequential damages, or loss of profits,
          cryptocurrencies, tokens, or anything else of value. We do not
          endorse, guarantee, or assume responsibility for any advertisements,
          offers, or statements made by third parties concerning the Interface.
          <br />
          <br />
        </Content>
        <BoldContent>Limitation of Liability</BoldContent>
        <ItalicContent>
          UNDER NO CIRCUMSTANCES SHALL WE OR ANY OF OUR OFFICERS, DIRECTORS,
          EMPLOYEES, CONTRACTORS, AGENTS, AFFILIATES, OR SUBSIDIARIES BE LIABLE
          TO YOU FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          OR EXEMPLARY DAMAGES, INCLUDING (BUT NOT LIMITED TO) DAMAGES FOR LOSS
          OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE PROPERTY, ARISING
          OUT OF OR RELATING TO ANY ACCESS OR USE OF THE INTERFACE, NOR WILL WE
          BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY RESULTING FROM HACKING,
          TAMPERING, OR OTHER UNAUTHORIZED ACCESS OR USE OF THE INTERFACE OR THE
          INFORMATION CONTAINED WITHIN IT. WE ASSUME NO LIABILITY OR
          RESPONSIBILITY FOR ANY: <B>(A)</B> ERRORS, MISTAKES, OR INACCURACIES
          OF CONTENT; <B>(B)</B> PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY
          NATURE WHATSOEVER, RESULTING FROM ANY ACCESS OR USE OF THE INTERFACE;{" "}
          <B>(C)</B> UNAUTHORIZED ACCESS OR USE OF ANY SECURE SERVER OR DATABASE
          IN OUR CONTROL, OR THE USE OF ANY INFORMATION OR DATA STORED THEREIN;{" "}
          <B>(D)</B> INTERRUPTION OR CESSATION OF FUNCTION RELATED TO THE
          INTERFACE; <B>(E)</B> BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT
          MAY BE TRANSMITTED TO OR THROUGH THE INTERFACE; <B>(F)</B> ERRORS OR
          OMISSIONS IN, OR LOSS OR DAMAGE INCURRED AS A RESULT OF THE USE OF,
          ANY CONTENT MADE AVAILABLE THROUGH THE INTERFACE; AND <B>(G)</B> THE
          DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY.
          <br />
          <br />
        </ItalicContent>
        <BoldContent>Dispute Resolution</BoldContent>
        <Content>
          We will use our best efforts to resolve any potential disputes through
          informal, good faith negotiations. If a potential dispute arises, you
          must contact us by sending an email to contact@dezswap.io so that we
          can attempt to resolve it without resorting to formal dispute
          resolution. If we aren&apos;t able to reach an informal resolution
          within sixty days of your email, then you and we both agree to resolve
          the potential dispute according to the process set forth below.
          <br />
          <br />
        </Content>
        <BoldContent>Class Action and Jury Trial Waiver</BoldContent>
        <Content>
          You must bring any and all Disputes against us in your individual
          capacity and not as a plaintiff in or member of any purported class
          action, collective action, private attorney general action, or other
          representative proceeding. This provision applies to class
          arbitration. You and we both agree to waive the right to demand a
          trial by jury.
          <br />
          <br />
        </Content>
        <BoldContent>Entire Agreement</BoldContent>
        <Content>
          These terms constitute the entire agreement between you and us with
          respect to the subject matter hereof. This Agreement supersedes any
          and all prior or contemporaneous written and oral agreements,
          communications and other understandings (if any) relating to the
          subject matter of the terms.
          <br />
          <br />
        </Content>
        <BoldContent>
          This app uses Google Analytics API and the app logs anonymized usage
          statistics in order to improve over time.
          <br />
          <br />
        </BoldContent>
        <Content>
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
        </Content>
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
