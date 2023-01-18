import { useMemo, useCallback } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { useTheme, css } from "@emotion/react";
import Modal from "components/Modal";
import SelectAssetForm from "components/SelectAssetForm";
import Typography from "components/Typography";
import Tooltip from "components/Tooltip";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useAssets from "hooks/useAssets";
import useHashModal from "hooks/useHashModal";
import usePairs from "hooks/usePair";
import { formatNumber, formatDecimals, amountToValue } from "utils";
import iconPlus from "assets/icons/icon-plus.svg";
import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import iconDefaultAsset from "assets/icons/icon-default-token.svg";

import PoolButton from "./PoolButton";

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

type PoolFormAddress = string | undefined;

interface PoolFormProps {
  addresses?: [PoolFormAddress, PoolFormAddress];
  onChange?: (addresses: [PoolFormAddress, PoolFormAddress]) => void;
}

function PoolForm({ addresses, onChange: handleChange }: PoolFormProps) {
  const theme = useTheme();
  const screenClass = useScreenClass();

  const { availableAssetAddresses, findPair } = usePairs();

  const { getAsset } = useAssets();

  const selectAsset1Modal = useHashModal("asset1");
  const selectAsset2Modal = useHashModal("asset2");

  const [selectedAddress1, selectedAddress2] = addresses || [];

  const [asset1, asset2] = useMemo(() => {
    return [selectedAddress1, selectedAddress2].map((address) => {
      return address ? getAsset(address) : undefined;
    });
  }, [getAsset, selectedAddress1, selectedAddress2]);
  const pair = useMemo(() => {
    return selectedAddress1 && selectedAddress2
      ? findPair([selectedAddress1, selectedAddress2])
      : undefined;
  }, [findPair, selectedAddress1, selectedAddress2]);

  const closeSelectAssetModals = useCallback(() => {
    selectAsset1Modal.close();
    selectAsset2Modal.close();
  }, [selectAsset1Modal, selectAsset2Modal]);

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
            { key: "asset1", asset: asset1, modal: selectAsset1Modal },
            { key: "asset2", asset: asset2, modal: selectAsset2Modal },
          ].map(({ key, asset, modal }) => (
            <Col xs={12} sm={6} key={key}>
              <PoolButton variant="default" onClick={() => modal.open()}>
                <Row
                  css={css`
                    width: 100%;
                  `}
                  align="center"
                  justify="start"
                  gutterWidth={0}
                  wrap="nowrap"
                >
                  <Col width="auto">
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
                              background-image: ${`url(${
                                asset.iconSrc || iconDefaultAsset
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
                  <Col width="auto" style={{ marginLeft: "auto" }}>
                    <Typography size={14} weight={700}>
                      Balance:&nbsp;
                      <span
                        css={css`
                          color: ${theme.colors.primary};
                        `}
                      >
                        {formatNumber(
                          formatDecimals(
                            amountToValue(asset?.balance, asset?.decimals) || 0,
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
              </PoolButton>
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
        {!selectedAddress1 || !selectedAddress2 ? (
          <PoolButton variant="primary" disabled>
            Select tokens first
          </PoolButton>
        ) : undefined}
        {selectedAddress1 && selectedAddress2 && pair ? (
          <Link
            to={`/pool/add-liquidity/${pair.contract_addr}`}
            css={css`
              text-decoration: none;
            `}
          >
            <PoolButton as="div" variant="primary">
              Add liquidity
            </PoolButton>
          </Link>
        ) : undefined}
        {selectedAddress1 && selectedAddress2 && !pair ? (
          <Tooltip content="Coming soon" placement="top" arrow>
            <div>
              <PoolButton variant="primary" disabled>
                Create a new pool
              </PoolButton>
            </div>
          </Tooltip>
        ) : undefined}
      </div>

      <Modal
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
          // TODO: addressList should be changed for pool creation
          addressList={availableAssetAddresses.addresses}
          hasBackButton
          goBackOnSelect
          onGoBack={() => closeSelectAssetModals()}
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
            }
          }}
        />
      </Modal>
    </Wrapper>
  );
}

export default PoolForm;
