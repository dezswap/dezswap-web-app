import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import { useMemo, useState } from "react";

import iconShift from "~/assets/icons/icon-shift.svg";

import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

import useAssets from "~/hooks/useAssets";
import usePool from "~/hooks/usePool";

import { amountToValue, formatDecimals } from "~/utils";
import { getAddressFromAssetInfo } from "~/utils/dezswap";

interface PoolValueButtonProps {
  poolAddress: string;
}

const Wrapper = styled.button`
  width: auto;
  height: auto;
  position: relative;
  background-color: ${({ theme }) => theme.colors.text.background};
  border-radius: 12px;
  padding: 7px 12px;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  border: none;
  outline: none;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;

  &:hover {
    background-color: #e0e0e0;
  }

  .${MOBILE_SCREEN_CLASS} & {
    font-size: 14px;
    padding: 8.5px 12px;
  }
`;

const IconShift = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  display: inline-block;
  background-image: url(${iconShift});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 50% 50%;
`;

function PoolValueButton({ poolAddress }: PoolValueButtonProps) {
  const pool = usePool(poolAddress);
  const { getAsset } = useAssets();
  const [isOpposite, setIsOpposite] = useState(false);

  const assets = useMemo(() => {
    const res =
      pool?.assets.map((asset) => {
        const address = getAddressFromAssetInfo(asset.info);
        return address ? getAsset(address) : undefined;
      }) || [];
    if (isOpposite) {
      return res.toReversed();
    }
    return res;
  }, [getAsset, isOpposite, pool]);

  const ratio = useMemo(() => {
    if (!pool) {
      return 0;
    }
    const poolAssets = isOpposite ? pool.assets.toReversed() : pool.assets;
    const value0 =
      amountToValue(poolAssets[0].amount, assets[0]?.decimals) || 1;
    const value1 =
      amountToValue(poolAssets[1].amount, assets[1]?.decimals) || 1;
    return Numeric.parse(value1).div(value0).toNumber();
  }, [assets, isOpposite, pool]);

  return (
    <Wrapper onClick={() => setIsOpposite((current) => !current)}>
      <span>1 {assets[0]?.symbol}</span>
      <IconShift />
      <span>
        {formatDecimals(ratio, 3)} {assets[1]?.symbol}
      </span>
    </Wrapper>
  );
}

export default PoolValueButton;
