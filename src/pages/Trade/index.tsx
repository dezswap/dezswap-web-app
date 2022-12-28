import { Outlet } from "react-router-dom";
import TabButton from "components/TabButton";
import { Col, Container, Row } from "react-grid-system";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Panel from "components/Panel";
import IconButton from "components/IconButton";
import iconOverview from "assets/icons/icon-overview-38px.svg";
import iconOverviewHover from "assets/icons/icon-overview-38px-hover.svg";
import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";
import useSettingsModal from "hooks/modals/useSettingsModal";
import { MOBILE_SCREEN_CLASS } from "constants/layout";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  padding-top: 30px;

  .${MOBILE_SCREEN_CLASS} & {
    padding-top: 26px;
  }

  & #main:has(.inner-modal) > div:first-of-type {
    opacity: 0;
  }
`;

function TradePage() {
  const settingsModal = useSettingsModal();
  return (
    <Wrapper>
      <Container>
        <Row justify="center" gutterWidth={0}>
          <Col width={512} xs={12} id="main">
            <Panel shadow border>
              <Row
                css={css`
                  margin-bottom: 23px;
                `}
              >
                <Col style={{ paddingRight: 0 }}>
                  <IconButton
                    size={38}
                    icons={{ default: iconOverview, hover: iconOverviewHover }}
                  />
                </Col>
                <Col width={194}>
                  <TabButton
                    selectedIndex={0}
                    defaultSelectedIndex={0}
                    items={[
                      { label: "Swap", value: "trade/swap" },
                      { label: "Limit", value: "trade/limit" },
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
