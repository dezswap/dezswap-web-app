import styled from "@emotion/styled";
import iconDropdown from "assets/icons/icon-dropdown-24px.svg";
import { useEffect, useState } from "react";

type ExpandProps = React.PropsWithChildren<{
  label?: React.ReactNode;
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

const Label = styled.button`
  width: 100%;
  height: auto;
  position: relative;
  background-color: ${({ theme }) => theme.colors.text.background};
  border: none;
  border-radius: 0;
  padding: 12px 16px;
  margin: 0;
  text-align: left;
  cursor: pointer;

  .xs & {
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

    .xs & {
      right: 16px;
    }
  }
`;

Label.defaultProps = {
  type: "button",
};

const Content = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  background-color: ${({ theme }) => theme.colors.text.background};
  max-height: 0px;
  overflow: hidden;
  padding: 0px 16px;
  transition: max-height 0.25s cubic-bezier(0, 1, 0, 1),
    padding-top 1s cubic-bezier(0, 1, 0, 1),
    padding-bottom 1s cubic-bezier(0, 1, 0, 1);
  .expanded & {
    padding-top: 5px;
    padding-bottom: 12px;
    max-height: 600px;
    .xs & {
      padding: 12px 16px;
      max-height: 300px;
    }
  }
`;

function Expand({
  label,
  children,
  isExpanded: isExpandedFromProps,
  onLabelClick: handleLabelClick,
}: ExpandProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedFromProps || false);
  useEffect(() => {
    setIsExpanded(isExpandedFromProps || false);
  }, [isExpandedFromProps]);
  return (
    <Wrapper className={isExpanded ? "expanded" : ""}>
      <Label
        onClick={(event) => {
          if (handleLabelClick) {
            handleLabelClick(event);
          } else {
            setIsExpanded((current) => !current);
          }
        }}
      >
        {label}
      </Label>
      <Content>{children}</Content>
    </Wrapper>
  );
}

export default Expand;
