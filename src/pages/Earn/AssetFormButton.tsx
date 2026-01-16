import { PropsOf, css } from "@emotion/react";

import Button from "~/components/Button";
import Panel from "~/components/Panel";

import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

type AssetFormButtonProps = Omit<PropsOf<typeof Button>, "size" | "block">;

function AssetFormButton(props: AssetFormButtonProps) {
  return (
    <Panel
      shadow
      noPadding
      border={false}
      css={
        !props.disabled &&
        css`
          &:hover {
            box-shadow: 6px 6px 0px #000000;
            .${MOBILE_SCREEN_CLASS} & {
              box-shadow: 3px 3px 0px #000000;
            }
          }
        `
      }
    >
      <Button size="xLarge" block {...props} />
    </Panel>
  );
}

export default AssetFormButton;
