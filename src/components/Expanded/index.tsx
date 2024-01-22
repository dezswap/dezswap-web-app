import styled from "@emotion/styled";
import iconDropdown from "assets/icons/icon-dropdown-24px.svg";
import { useEffect, useState } from "react";
import { MOBILE_SCREEN_CLASS } from "constants/layout";

type ExpandProps = React.PropsWithChildren<{
  label?: React.ReactNode;
  preview?: React.ReactNode;
  isExpanded?: boolean;
  onLabelClick?: React.MouseEventHandler<HTMLButtonElement>;
}>;

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

const Label = styled.div`
  width: 100%;
  height: 48px;
  position: relative;
  background-color: ${({ theme }) => theme.colors.text.background};
  border: none;
  border-radius: 0;
  padding: 12px 16px;
  margin: 0;
  text-align: left;
  cursor: pointer;

  .${MOBILE_SCREEN_CLASS} & {
    padding: 16px;
    padding-bottom: 14px;
  }

  &::after {
    content: "";
    width: 24px;
    height: 24px;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%) rotate(0deg);
    transition: transform 0.3s ease;
    background-image: url(${iconDropdown});
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    .expanded & {
      transform: translateY(-50%) rotate(180deg);
    }

    .cm & {
      display: none;
    }

    .${MOBILE_SCREEN_CLASS} & {
      right: 16px;
    }
  }
`;

const Content = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  background-color: ${({ theme }) => theme.colors.text.background};
  max-height: 0px;
  overflow: hidden;
  padding: 0px 16px;
  transition: max-height 0.25s cubic-bezier(0, 1, 0, 1);
  .expanded &,
  .cm & {
    padding-bottom: 12px;
    max-height: 600px;
    .${MOBILE_SCREEN_CLASS} & {
      padding-bottom: 16px;
      max-height: 300px;
    }
  }
`;

const PreviewContent = styled(Content)`
  max-height: unset !important;
  transition: unset;
  padding-bottom: 12px;
  .${MOBILE_SCREEN_CLASS} & {
    padding-bottom: 16px;
  }
  .expanded &,
  .cm & {
    padding-bottom: 0;
    .${MOBILE_SCREEN_CLASS} & {
      padding-bottom: 0;
    }
  }
`;

function Expand({
  label,
  preview,
  children,
  isExpanded: isExpandedFromProps,
}: ExpandProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedFromProps || false);
  useEffect(() => {
    setIsExpanded(isExpandedFromProps || false);
  }, [isExpandedFromProps]);
  return (
    <Wrapper className={isExpanded ? "expanded" : ""}>
      {label && (
        <Label onClick={() => setIsExpanded((current) => !current)}>
          {label}
        </Label>
      )}
      {preview && (
        <PreviewContent style={!label ? { paddingTop: 12 } : {}}>
          {preview}
        </PreviewContent>
      )}
      {children && <Content>{children}</Content>}
    </Wrapper>
  );
}

export default Expand;
