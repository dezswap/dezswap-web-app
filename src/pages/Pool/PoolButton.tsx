import { css, PropsOf } from "@emotion/react";
import Button from "components/Button";
import Panel from "components/Panel";

type PoolButtonProps = Omit<PropsOf<typeof Button>, "size" | "block">;

function PoolButton(props: PoolButtonProps) {
  return (
    <Panel
      shadow
      noPadding
      border={false}
      css={css`
        &:hover {
          box-shadow: 6px 6px 0px #000000;
        }
      `}
    >
      <Button size="xLarge" block {...props} />
    </Panel>
  );
}
export default PoolButton;
