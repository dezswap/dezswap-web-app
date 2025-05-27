import styled from "@emotion/styled";
import AssetIcon from "components/AssetIcon";
import Modal from "components/Modal";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChains } from "constants/dezswap";
import {
  DEFAULT_GUTTER_WIDTH,
  GRID_MAX_WIDTH,
  MOBILE_SCREEN_CLASS,
} from "constants/layout";
import useNetwork from "hooks/useNetwork";
import { useMemo } from "react";
import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import { useSearchParams } from "react-router-dom";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  inset: 0;
  z-index: 5000;
`;

const ChainsWrapper = styled.button`
  width: 100%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  padding: 16px 13px;
  gap: 6px;
  font-size: 16px;
  font-weight: 700;
  &:first-of-type {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      left: 13px;
      right: 13px;
      top: 0;
      display: block;
      height: 1px;
      background-color: ${({ theme }) => theme.colors.primary};
    }
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
  }
`;
function ChainModal(modalProps: ReactModal.Props) {
  const screenClass = useScreenClass();
  const { chainName } = useNetwork();
  const isTestnet = useMemo(() => chainName !== "xpla", [chainName]);
  const [searchParams, setSearchParams] = useSearchParams();

  return modalProps.isOpen ? (
    <Overlay onClick={modalProps.onRequestClose}>
      <Modal
        {...modalProps}
        title="Select a network"
        hasCloseButton
        drawer={screenClass === MOBILE_SCREEN_CLASS}
        overlay={screenClass === MOBILE_SCREEN_CLASS}
        noPadding
        style={
          screenClass === MOBILE_SCREEN_CLASS
            ? {}
            : {
                overlay: {
                  position: "absolute",
                  width: `calc(100% - ${DEFAULT_GUTTER_WIDTH}px)`,
                  maxWidth: `${GRID_MAX_WIDTH[screenClass]}`,
                  margin: "0 auto",
                  alignItems: "start",
                  justifyContent: "end",
                },
                content: {
                  marginTop: isTestnet ? "135px" : "105px",
                  marginRight: "116px",
                  top: "0",
                  width: "372px",
                },
                panel: {
                  maxHeight: "unset",
                  overflowY: "visible",
                  overflow: "hidden",
                },
              }
        }
      >
        {DefaultChains.map((chain) => (
          <ChainsWrapper
            onClick={(e) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set(CHAIN_NAME_SEARCH_PARAM, chain.chainName);
              setSearchParams(newParams);
            }}
            type="button"
          >
            <AssetIcon
              asset={{
                icon: chain.logoURIs?.svg ?? chain.logoURIs?.png,
              }}
            />
            {chain.prettyName}
          </ChainsWrapper>
        ))}
      </Modal>
    </Overlay>
  ) : null;
}

export default ChainModal;
