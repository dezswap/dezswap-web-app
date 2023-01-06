import { FormEventHandler, useCallback, useEffect, useMemo } from "react";
import Modal from "components/Modal";
import { useNavigate, useParams } from "react-router-dom";
import usePairs from "hooks/usePair";
import useAssets from "hooks/useAssets";
import { useForm } from "react-hook-form";
import { useScreenClass } from "react-grid-system";
import { css } from "@emotion/react";
import iconProvide from "assets/icons/icon-provide.svg";
import Expand from "components/Expanded";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import InputGroup from "./InputGroup";

enum FormKey {
  asset1Value = "asset1Value",
  asset2Value = "asset2Value",
}

function ProvidePage() {
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const { getPair, pairs } = usePairs();
  const { getAsset } = useAssets();
  const pair = useMemo(
    () => (pairAddress ? getPair(pairAddress) : undefined),
    [getPair, pairAddress],
  );
  const [asset1, asset2] = useMemo(
    () => (pair?.asset_addresses || []).map((address) => getAsset(address)),
    [getAsset, pair?.asset_addresses],
  );

  const form = useForm<Record<FormKey, string>>({
    criteriaMode: "all",
    mode: "all",
  });
  const formData = form.watch();
  const { register, formState } = form;

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
      event.preventDefault();
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    navigate("/pool", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (pairs?.length && !pair) {
        handleModalClose();
      }
    }, 500); // wait for 500ms to make sure the pair is loaded
    return () => {
      clearTimeout(timerId);
    };
  }, [handleModalClose, pair, pairs?.length]);

  return (
    <Modal
      isOpen
      title="Add liquidity"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={() => handleModalClose()}
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          {...register(FormKey.asset1Value)}
          asset={asset1}
          onBalanceClick={(value) => {
            form.setValue(FormKey.asset1Value, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
        />
        <div
          css={css`
            position: relative;
            width: 100%;
            height: 28px;
            margin-top: -9px;
            margin-bottom: -9px;
            background-image: url(${iconProvide});
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: contain;
            z-index: 1;
          `}
        />
        <InputGroup
          {...register(FormKey.asset2Value)}
          asset={asset2}
          onBalanceClick={(value) => {
            form.setValue(FormKey.asset2Value, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
          style={{ marginBottom: 10 }}
        />
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <Expand
            label="Summary"
            preview={
              <div>
                Preview
                <br />
                Preview
                <br />
                Preview
                <br />
                Preview
                <br />
              </div>
            }
          >
            Children
            <br />
            Children
            <br />
            Children
            <br />
            Children
            <br />
            Children
            <br />
            Children
            <br />
          </Expand>
        </div>
        <Button type="submit" size="large" variant="primary" block>
          Add liquidity
        </Button>
      </form>
    </Modal>
  );
}

export default ProvidePage;
