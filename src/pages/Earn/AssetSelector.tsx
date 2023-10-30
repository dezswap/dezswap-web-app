import { useMemo, useCallback } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import styled from "@emotion/styled";
import { useTheme, css } from "@emotion/react";
import Modal from "components/Modal";
import SelectAssetForm from "components/SelectAssetForm";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useAssets from "hooks/useAssets";
import useHashModal from "hooks/useHashModal";
import usePairs from "hooks/usePairs";
import { formatNumber, formatDecimals, amountToValue } from "utils";
import iconPlus from "assets/icons/icon-plus.svg";
import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import iconDefaultAsset from "assets/icons/icon-default-token.svg";

import Button from "components/Button";
import useModal from "hooks/useModal";
import { useAtom } from "jotai";
import useNetwork from "hooks/useNetwork";
import { customAssetsAtom } from "stores/assets";
import useBalance from "hooks/useBalance";
import ImportAssetModal from "./ImportAssetModal";
import AssetFormButton from "./AssetFormButton";

type AssetFormAddress = string | undefined;

interface AssetFormProps {
  addresses?: [AssetFormAddress, AssetFormAddress];
  onChange?: (addresses: [AssetFormAddress, AssetFormAddress]) => void;
  extra?: React.ReactNode;
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  column-gap: 58px;

  & > div {
    flex: 1;
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    row-gap: 20px;
  }
`;

function AssetSelector({
  addresses,
  onChange: handleChange,
  extra,
}: AssetFormProps) {
  const theme = useTheme();
  const screenClass = useScreenClass();

  const { availableAssetAddresses, findPair } = usePairs();
  const network = useNetwork();
  const [customAssetStore] = useAtom(customAssetsAtom);
  const customAssetAddresses = useMemo(() => {
    return customAssetStore[network.name]?.map((asset) => asset.token) || [];
  }, [customAssetStore, network.name]);

  const { getAsset } = useAssets();

  const selectAsset1Modal = useHashModal("asset1");
  const selectAsset2Modal = useHashModal("asset2");

  const [selectedAddress1, selectedAddress2] = addresses || [];

  const [asset1, asset2] = useMemo(() => {
    return [selectedAddress1, selectedAddress2].map((address) => {
      return address ? getAsset(address) : undefined;
    });
  }, [getAsset, selectedAddress1, selectedAddress2]);

  const balance1 = useBalance(asset1?.token);
  const balance2 = useBalance(asset2?.token);

  const pair = useMemo(() => {
    return selectedAddress1 && selectedAddress2
      ? findPair([selectedAddress1, selectedAddress2])
      : undefined;
  }, [findPair, selectedAddress1, selectedAddress2]);

  const closeSelectAssetModals = useCallback(() => {
    selectAsset1Modal.close();
    selectAsset2Modal.close();
  }, [selectAsset1Modal, selectAsset2Modal]);

  const importAssetModal = useModal();

  return (
    <Wrapper>
      <div>
        <Row
          justify="between"
          align="center"
          gutterWidth={44}
          css={css`
            background-image: url(${iconPlus});
            background-repeat: no-repeat;
            background-position: 50% 50%;
            background-size: 24px 24px;
            row-gap: 45px;
          `}
        >
          {[
            {
              key: "asset1",
              asset: asset1,
              modal: selectAsset1Modal,
              balance: balance1,
            },
            {
              key: "asset2",
              asset: asset2,
              modal: selectAsset2Modal,
              balance: balance2,
            },
          ].map(({ key, asset, modal, balance }) => (
            <Col xs={12} sm={6} key={key}>
              <AssetFormButton variant="default" onClick={() => modal.open()}>
                <Row
                  css={css`
                    width: 100%;
                  `}
                  align="center"
                  justify="start"
                  gutterWidth={0}
                  wrap="nowrap"
                >
                  <Col width="auto" style={{ paddingRight: 10 }}>
                    <Typography
                      color="primary"
                      size={16}
                      weight={700}
                      css={css`
                        padding-left: 12px;
                        .${MOBILE_SCREEN_CLASS} &,
                        .${TABLET_SCREEN_CLASS} & {
                          padding-left: 3px;
                        }
                      `}
                    >
                      {asset ? (
                        <div
                          css={css`
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            gap: 4px;

                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                          `}
                        >
                          <div
                            css={css`
                              width: 24px;
                              height: 24px;
                              position: relative;
                              background-color: ${theme.colors.white};
                              border-radius: 50%;
                              background-image: ${`url(${
                                asset.icon || iconDefaultAsset
                              })`};
                              background-size: contain;
                              background-position: 50% 50%;
                              background-repeat: no-repeat;
                            `}
                          />
                          {asset.symbol}
                        </div>
                      ) : (
                        "Select a token"
                      )}
                    </Typography>
                  </Col>
                  <Col
                    width="auto"
                    style={{ marginLeft: "auto", overflow: "hidden" }}
                  >
                    <Typography
                      size={14}
                      weight={700}
                      css={css`
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 160px;
                      `}
                    >
                      Balance:&nbsp;
                      <span
                        css={css`
                          color: ${theme.colors.primary};
                        `}
                      >
                        {formatNumber(
                          formatDecimals(
                            amountToValue(balance, asset?.decimals) || 0,
                            3,
                          ),
                        )}
                      </span>
                    </Typography>
                  </Col>
                  <Col width="auto">
                    <div
                      css={css`
                        width: 22px;
                        height: 22px;
                        position: relative;
                        background-image: url(${iconDropdown});
                        background-size: contain;
                        background-position: 50% 50%;
                        background-repeat: no-repeat;
                        margin-left: 4px;
                      `}
                    />
                  </Col>
                </Row>
              </AssetFormButton>
            </Col>
          ))}
        </Row>
      </div>
      <div
        css={css`
          max-width: 300px;
          .${MOBILE_SCREEN_CLASS} &,
          .${TABLET_SCREEN_CLASS} & {
            max-width: unset;
          }
        `}
      >
        {extra}
      </div>

      <Modal
        title="Select a token"
        hasCloseButton
        isOpen={selectAsset1Modal.isOpen || selectAsset2Modal.isOpen}
        drawer={screenClass === MOBILE_SCREEN_CLASS}
        onRequestClose={() => closeSelectAssetModals()}
        noPadding
        style={{
          panel: {
            maxHeight: "unset",
            overflowY: "visible",
          },
        }}
      >
        <SelectAssetForm
          addressList={[...customAssetAddresses, ...availableAssetAddresses]}
          onSelect={(address) => {
            if (handleChange) {
              const newAddresses = [...(addresses || [])];
              if (selectAsset1Modal.isOpen) {
                newAddresses[0] = address;
              }
              if (selectAsset2Modal.isOpen) {
                newAddresses[1] = address;
              }

              if (newAddresses[0] === newAddresses[1]) {
                newAddresses[1] = undefined;
              }

              handleChange([newAddresses[0], newAddresses[1]]);
              closeSelectAssetModals();
            }
          }}
        >
          <div
            css={css`
              padding: 16px 27px;
              .${MOBILE_SCREEN_CLASS} & {
                padding: 15px 13px;
              }
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}
          >
            <Typography color="primary" size={16} weight={700}>
              Don&apos;t see your token?
            </Typography>
            <Button variant="primary" onClick={() => importAssetModal.open()}>
              Import
            </Button>
          </div>
        </SelectAssetForm>
      </Modal>
      <ImportAssetModal
        isOpen={importAssetModal.isOpen}
        onRequestClose={importAssetModal.close}
        onFinish={() => importAssetModal.close()}
        preventScroll
      />
    </Wrapper>
  );
}

export default AssetSelector;
