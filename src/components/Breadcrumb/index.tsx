import styled from "@emotion/styled";
import Typography from "components/Typography";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

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

const Item = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

function Breadcrumb(props: BreadcrumbProps) {
  const { items } = props;

  return (
    <Wrapper aria-label="breadcrumb">
      {items.map((item, index) => (
        <Item key={`${item.label} ${item.to}`}>
          {index === items.length - 1 ? (
            <Typography color="primary" weight={900} size={16}>
              {item.label}
            </Typography>
          ) : (
            <>
              <Link to={item.to}>
                <Typography color="primary" weight={400} size={16}>
                  {item.label}
                </Typography>
              </Link>
              <Typography color="primary" weight={400} size={16}>
                &nbsp;&gt;&nbsp;
              </Typography>
            </>
          )}
        </Item>
      ))}
    </Wrapper>
  );
}

export default Breadcrumb;
