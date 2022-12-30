import styled from "@emotion/styled";
import Typography from "components/Typography";
import { useId } from "react";

interface TabButtonItem {
  label?: string;
  value: string;
  disabled?: boolean;
  key?: React.Key;
}

type TabButtonSize = "default" | "large";

interface TabButtonProps {
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  onChange?: (index: number) => void;
  items: TabButtonItem[];
  size?: TabButtonSize;
}

const Wrapper = styled.div<{ size?: TabButtonSize }>`
  width: 100%;
  height: ${({ size }) => (size === "large" ? "45px" : "38px")};
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 30px;
  font-size: 0;
  line-height: 1;
  user-select: none;
`;

const TabItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  font-size: 0;
  line-height: 0;
  height: 100%;

  & > input {
    width: 0%;
    height: 0%;
    opacity: 0;
    position: absolute;
    z-index: -1;
  }

  & > label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    transition: all 0.125s ease-in-out;
    border-radius: 30px;
    cursor: pointer;

    & > * {
      color: ${({ theme }) => theme.colors.primary};
      transition: all 0.125s ease-in-out;
    }
  }

  & > input:checked + label {
    background-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0px 0px 0 1px ${({ theme }) => theme.colors.primary};
    & > * {
      color: ${({ theme }) => theme.colors.white};
    }
  }

  & > input:disabled + label {
    cursor: default;
  }
`;
function TabButton({
  selectedIndex,
  defaultSelectedIndex,
  onChange,
  items,
  size = "default",
}: TabButtonProps) {
  const id = useId();
  return (
    <Wrapper size={size}>
      {items.map((item, index) => {
        const isControlled = selectedIndex !== undefined;
        const isSelected = isControlled
          ? index === selectedIndex
          : index === defaultSelectedIndex;
        return (
          <TabItem key={item.key ?? `${item.value} ${item.label}`}>
            <input
              type="radio"
              id={`${id}-${index}`}
              name={id}
              value={item.value}
              disabled={item.disabled}
              checked={isControlled ? isSelected : undefined}
              defaultChecked={!isControlled ? isSelected : undefined}
              onChange={() => {
                onChange?.(index);
              }}
            />
            <label htmlFor={`${id}-${index}`}>
              <Typography size={14} weight={900}>
                {item.label ?? item.value}
              </Typography>
            </label>
          </TabItem>
        );
      })}
    </Wrapper>
  );
}

export default TabButton;
