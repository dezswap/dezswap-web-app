import { css } from "@emotion/react";
import styled from "@emotion/styled";
import iconCaution from "assets/icons/icon-caution.svg";

type MessageProps = React.PropsWithChildren<{
  variant?: "guide" | "error" | "warning"; // TODO: "default" | "success" | "error" | "warning";
  showIcon?: boolean;
}>;

const Wrapper = styled.div<Pick<MessageProps, "variant">>`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  opacity: 0.6;
  font-size: 14px;
  font-weight: 700;
  line-height: normal;

  ${({ variant, theme }) => {
    switch (variant) {
      case "guide":
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
      case "error":
        return css`
          background-color: ${theme.colors.danger};
          color: ${theme.colors.white};
        `;
      case "warning":
        return css`
          background-color: ${theme.colors.warning};
          color: ${theme.colors.white};
        `;
      default:
        return css`
          /* TODO */
        `;
    }
  }}
`;

const Content = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 3px;
`;

const Icon = styled.div<{ src?: string }>`
  position: relative;
  width: 24px;
  height: 24px;

  background-image: url(${({ src }) => src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
`;

const getIconSrc = (variant: MessageProps["variant"]) => {
  switch (variant) {
    case "guide":
    case "error":
    case "warning":
      return iconCaution;
    default:
      return undefined;
  }
};

function Message({
  variant = "error",
  showIcon = true,
  children,
}: MessageProps) {
  const iconSrc = getIconSrc(variant);
  return (
    <Wrapper variant={variant}>
      {showIcon && iconSrc && <Icon src={iconSrc} />}
      <Content>{children}</Content>
    </Wrapper>
  );
}

export default Message;
