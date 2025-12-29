import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Container, Row } from "react-grid-system";
import { Outlet } from "react-router-dom";

import iconOverviewHover from "~/assets/icons/icon-overview-disabled-hover.svg";
import iconOverview from "~/assets/icons/icon-overview-disabled.svg";
import iconSettingHover from "~/assets/icons/icon-setting-hover.svg";
import iconSetting from "~/assets/icons/icon-setting.svg";

import IconButton from "~/components/IconButton";
import Panel from "~/components/Panel";
import ScrollToTop from "~/components/ScrollToTop";
import TabButton from "~/components/TabButton";
import Tooltip from "~/components/Tooltip";

import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

import useSettingsModal from "~/hooks/modals/useSettingsModal";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  padding-top: 30px;
  z-index: 10;

  .${MOBILE_SCREEN_CLASS} & {
    padding-top: 26px;
  }
`;

function TradePage() {
  const settingsModal = useSettingsModal();
  return (
    <Wrapper>
      <ScrollToTop />
      <Container>
        <Row justify="center" gutterWidth={0}>
          <Col width={512} xs={12} className="modal-parent">
            <Panel shadow border>
              <Row
                css={css`
                  margin-bottom: 23px;
                `}
              >
                <Col style={{ paddingRight: 0 }}>
                  <Tooltip content="Coming soon">
                    <IconButton
                      size={38}
                      icons={{
                        default: iconOverview,
                        hover: iconOverviewHover,
                      }}
                    />
                  </Tooltip>
                </Col>
                <Col width={194}>
                  <TabButton
                    selectedIndex={0}
                    defaultSelectedIndex={0}
                    items={[
                      { label: "Swap", value: "trade/swap" },
                      {
                        label: (
                          <Tooltip content="Coming soon">
                            <span>Limit</span>
                          </Tooltip>
                        ),
                        value: "trade/limit",
                        disabled: true,
                      },
                    ]}
                  />
                </Col>
                <Col style={{ paddingLeft: 0, textAlign: "right" }}>
                  <IconButton
                    size={38}
                    icons={{ default: iconSetting, hover: iconSettingHover }}
                    onClick={() => settingsModal.open()}
                  />
                </Col>
              </Row>
              <Outlet />
            </Panel>
          </Col>
        </Row>
      </Container>
    </Wrapper>
  );
}

export default TradePage;
