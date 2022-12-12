import styled from "@emotion/styled";
import Button from "components/Button";
import { Container } from "react-grid-system";
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
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { css } from "@emotion/react";

const Wrapper = styled.footer`
  width: 100%;
  height: auto;
  position: relative;
  padding: 30px 0;
`;

const Content = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;

  justify-content: space-between;
  align-items: center;
  gap: 30px;

  .${MOBILE_SCREEN_CLASS} & {
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
  {
    name: "Medium",
    url: "#", // TODO: Add Medium link
    icons: {
      default: iconMedium,
      hover: iconMediumHover,
    },
  },
  {
    name: "Twitter",
    url: "#", // TODO: Add Twitter link
    icons: {
      default: iconTwitter,
      hover: iconTwitterHover,
    },
  },
  {
    name: "Discord",
    url: "#", // TODO: Add Discord link
    icons: {
      default: iconDiscord,
      hover: iconDiscordHover,
    },
  },
  {
    name: "GitHub",
    url: "#", // TODO: Add GitHub link
    icons: {
      default: iconGitHub,
      hover: iconGitHubHover,
    },
  },
  {
    name: "Documents",
    url: "#", // TODO: Add Documents link
    icons: {
      default: iconDocs,
      hover: iconDocsHover,
    },
  },
];

function Footer() {
  return (
    <Wrapper>
      <Container>
        <Content>
          <div>
            <Button
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
                #1234567
              </span>
              &nbsp;
              <IconButton icons={{ default: iconLink }} size={16} />
            </Button>
          </div>
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
        </Content>
      </Container>
    </Wrapper>
  );
}

export default Footer;
