import styled from "@emotion/styled";
import { LinkProps } from "react-router-dom";

import Link from "~/components/Link";
import Typography from "~/components/Typography";
import HoverUnderline from "~/components/utils/HoverUnderline";

interface BreadcrumbItem {
  label: string;
  to: LinkProps["to"];
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Wrapper = styled.nav`
  width: 100%;
  height: auto;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Item = styled(Typography)`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  font-weight: 500;

  &::after {
    content: ">";
    margin: 0 4px;
  }

  &:last-of-type {
    font-weight: 900;
    pointer-events: none;
    &::after {
      content: unset;
    }
  }
`;

function Breadcrumb(props: BreadcrumbProps) {
  const { items } = props;

  return (
    <Wrapper aria-label="breadcrumb">
      {items.map((item) => (
        <Item key={`${item.label} ${item.to}`}>
          <Link to={item.to}>
            <HoverUnderline>{item.label}</HoverUnderline>
          </Link>
        </Item>
      ))}
    </Wrapper>
  );
}

export default Breadcrumb;
