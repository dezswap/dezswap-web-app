import styled from "@emotion/styled";
import { useId } from "react";

interface ToggleButtonProps {
  items: string[];
  defaultSelectedIndex?: number;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

const Wrapper = styled.div`
  width: auto;
  height: auto;
  position: relative;
  display: inline-flex;

  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 4px;
  border-radius: 30px;
`;

const Item = styled.label`
  width: auto;
  height: auto;
  position: relative;
  padding: 3px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 900;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;

  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.secondary};
  user-select: none;

  cursor: pointer;

  & > input {
    width: 0%;
    height: 0%;
    position: absolute;
    opacity: 0;
    left: -100%;
    top: -100%;
  }

  &:has(input:checked) {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

function ToggleButton({
  items,
  defaultSelectedIndex = 0,
  selectedIndex,
  onSelect,
}: ToggleButtonProps) {
  const name = useId();
  return (
    <Wrapper>
      {items.map((item, index) => (
        <Item key={item}>
          <input
            type="radio"
            name={name}
            value={item}
            defaultChecked={defaultSelectedIndex === index}
            checked={
              selectedIndex !== undefined ? selectedIndex === index : undefined
            }
            onChange={() => onSelect?.(index)}
          />
          {item}
        </Item>
      ))}
    </Wrapper>
  );
}

export default ToggleButton;
