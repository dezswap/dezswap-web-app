import { css } from "@emotion/react";
import styled from "@emotion/styled";
import iconToken from "assets/icons/icon-default-token.svg";
import iconVerified from "assets/icons/icon-verified.svg";
import Tooltip from "components/Tooltip";
import { Token } from "types/api";

interface AssetIconProps {
  asset: Partial<Token>;
}
const Wrapper = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  position: relative;
  display: inline-block;
  padding: 0px 6px;

  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;

  background-size: 32px 32px;
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;

function AssetIcon({
  asset: { icon: iconSrc, verified: isVerified, symbol },
}: AssetIconProps) {
  return (
    <Wrapper
      style={{
        backgroundImage: `url(${iconSrc || iconToken})`,
      }}
    >
      {isVerified && (
        <Tooltip content={`${symbol} is verified token`}>
          <div
            css={css`
              position: absolute;
              bottom: -3px;
              right: -3px;
              width: 18px;
              height: 18px;
              background-image: url(${iconVerified});
              background-size: contain;
              background-repeat: no-repeat;
              background-position: 50% 50%;
            `}
          />
        </Tooltip>
      )}
    </Wrapper>
  );
}

export default AssetIcon;
