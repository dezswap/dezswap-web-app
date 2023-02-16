import styled from "@emotion/styled";
import { TippyProps } from "@tippyjs/react";
import TooltipWithIcon from "components/Tooltip/TooltipWithIcon";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { useScreenClass } from "react-grid-system";

interface SummaryItem {
  key?: React.Key;
  label: React.ReactNode;
  value: React.ReactNode;
  tooltip?: TippyProps["content"];
}

interface SummaryProps {
  items: SummaryItem[];
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Item = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  gap: 20px;
  .${MOBILE_SCREEN_CLASS} & {
    gap: 10px;
  }
  justify-content: space-between;
  align-items: flex-start;

  & > div {
    white-space: pre-wrap;
    word-break: normal;
    word-wrap: break-word;
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 22px;
  }
`;

const Label = styled.div`
  flex: 5;
`;

const Value = styled.div`
  flex: 5;
  text-align: right;
`;

function InfoTable({ items }: SummaryProps) {
  const screenClass = useScreenClass();
  return (
    <Wrapper>
      {items.map((item) => {
        const { key, tooltip } = item;
        const [label, value] = [item.label, item.value].map((v) =>
          ["string", "number", "boolean"].includes(typeof v) ? (
            <span>{v}</span>
          ) : (
            v
          ),
        );
        return (
          <Item key={key}>
            <Label>
              {label}
              {tooltip && (
                <TooltipWithIcon
                  arrow
                  size={22}
                  content={tooltip}
                  placement={
                    screenClass === MOBILE_SCREEN_CLASS ? "top" : "right"
                  }
                />
              )}
            </Label>
            <Value>{value}</Value>
          </Item>
        );
      })}
    </Wrapper>
  );
}

export default InfoTable;
