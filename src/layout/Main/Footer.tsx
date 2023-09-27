import styled from "@emotion/styled";
import Button from "components/Button";
import { Container, Visible } from "react-grid-system";
import IconButton from "components/IconButton";

import iconMedium from "assets/icons/icon-medium.svg";
import iconMediumHover from "assets/icons/icon-medium-hover.svg";
import iconTwitter from "assets/icons/icon-twitter.svg";
import iconTwitterHover from "assets/icons/icon-twitter-hover.svg";
import iconDiscord from "assets/icons/icon-discord.svg";
import iconDiscordHover from "assets/icons/icon-discord-hover.svg";
import iconGitHub from "assets/icons/icon-github.svg";
import iconGitHubHover from "assets/icons/icon-github-hover.svg";
import iconDocs from "assets/icons/icon-docs.svg";
import iconDocsHover from "assets/icons/icon-docs-hover.svg";
import iconLink from "assets/icons/icon-link.svg";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { css } from "@emotion/react";
import { useLatestBlock } from "hooks/useLatestBlock";
import { getBlockLink } from "utils";
import useNetwork from "hooks/useNetwork";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import MobileDelegateBanner from "./MobileDelegateBanner";

const Wrapper = styled.footer`
  width: 100%;
  height: auto;
  position: relative;
  padding: 30px 0;
  .${TABLET_SCREEN_CLASS} & {
    padding: 22px 0;
  }
`;

const Content = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;

  justify-content: space-between;
  align-items: center;
  gap: 30px;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
  }
`;

const Badge = styled.div`
  width: 7px;
  height: 7px;
  position: relative;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
`;

const SocialMediaLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const socialMediaLinks = [
  // TODO: enable medium link
  // {
  //   name: "Medium",
  //   url: "https://medium.com/@dezswap",
  //   icons: {
  //     default: iconMedium,
  //     hover: iconMediumHover,
  //   },
  // },
  {
    name: "Twitter",
    url: "https://twitter.com/dezswap_io",
    icons: {
      default: iconTwitter,
      hover: iconTwitterHover,
    },
  },
  {
    name: "Discord",
    url: "https://discord.gg/ZQ2ps5H64t",
    icons: {
      default: iconDiscord,
      hover: iconDiscordHover,
    },
  },
  {
    name: "GitHub",
    url: "https://github.com/dezswap",
    icons: {
      default: iconGitHub,
      hover: iconGitHubHover,
    },
  },
  {
    name: "Documents",
    url: "https://docs.dezswap.io",
    icons: {
      default: iconDocs,
      hover: iconDocsHover,
    },
  },
];

const text1 = "Dezswap does not take any financial profit from the protocol.";

const text2 = "Trading fee goes to liquidity providers.";

function Footer() {
  const network = useNetwork();
  const latestBlock = useLatestBlock();
  return (
    <Wrapper>
      <Visible xs>
        <MobileDelegateBanner />
      </Visible>
      <Container>
        <Content>
          <Tooltip
            placement="top"
            content="The most recent block number on this network. Prices update on every block."
            css={css`
              width: 250px;
            `}
          >
            <a
              href={latestBlock ? getBlockLink(latestBlock, network.name) : ""}
              target="_blank"
              rel="noreferrer noopener"
              css={css`
                text-decoration: none;
              `}
            >
              <Button
                as="span"
                variant="default"
                css={css`
                  height: 36px;
                `}
              >
                <Badge />
                &nbsp;
                <span
                  css={css`
                    font-size: 12px;
                  `}
                >
                  #{latestBlock}
                </span>
                &nbsp;
                <IconButton as="span" icons={{ default: iconLink }} size={16} />
              </Button>
            </a>
          </Tooltip>
          <Visible lg md>
            <Typography
              size={14}
              weight={500}
              color="primary"
              css={css`
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                text-align: center;
              `}
            >
              {text1} {text2}
            </Typography>
          </Visible>
          <div>
            <SocialMediaLinks>
              {socialMediaLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <IconButton icons={item.icons} size={32} />
                </a>
              ))}
            </SocialMediaLinks>
          </div>
          <Visible sm>
            <Typography
              size={14}
              weight={500}
              color="primary"
              css={css`
                width: 100%;
                text-align: center;
              `}
            >
              {text1}
              <br />
              {text2}
            </Typography>
          </Visible>
        </Content>
      </Container>
    </Wrapper>
  );
}

export default Footer;
