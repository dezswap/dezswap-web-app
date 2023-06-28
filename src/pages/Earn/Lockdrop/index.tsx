import { css } from "@emotion/react";
import ScrollToTop from "components/ScrollToTop";
import { Col, Container, Row } from "react-grid-system";
import { useState } from "react";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Switch from "components/Switch";
import AssetSelector from "../AssetSelector";

function LockdropPage() {
  const [addresses, setAddresses] =
    useState<[string | undefined, string | undefined]>();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isLiveOnly, setIsLiveOnly] = useState(true);

  return (
    <>
      <ScrollToTop />

      <Container>
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <AssetSelector
            addresses={addresses}
            onChange={(newAddresses) => setAddresses(newAddresses)}
          />
        </div>

        <Panel shadow>
          <Row
            justify="between"
            align="center"
            css={css`
              gap: 20px;
              margin-bottom: 25px;
            `}
          >
            <Col xs={12} sm={6}>
              <div
                css={css`
                  max-width: 408px;
                  .${MOBILE_SCREEN_CLASS} &,
                  .${TABLET_SCREEN_CLASS} & {
                    max-width: unset;
                  }
                `}
              >
                <TabButton
                  size="large"
                  items={[
                    { value: "all", label: "All" },
                    { value: "my", label: "My" },
                    { value: "bookmark", label: "Bookmark" },
                  ]}
                  selectedIndex={selectedTabIndex}
                  onChange={(index) => setSelectedTabIndex(index)}
                />
              </div>
            </Col>
            <Col xs={12} sm="content">
              <Row align="center" justify="center" gutterWidth={8}>
                <Col xs="content">
                  <Typography color="primary" size={14} weight={900}>
                    Live only
                  </Typography>
                </Col>
                <Col width={80}>
                  <Switch
                    defaultChecked={isLiveOnly}
                    onClick={(event) => {
                      setIsLiveOnly(event.currentTarget.checked);
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Panel>
      </Container>
    </>
  );
}

export default LockdropPage;
