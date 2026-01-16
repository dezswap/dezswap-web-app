import { css } from "@emotion/react";
import styled from "@emotion/styled";

import iconSortAsc from "~/assets/icons/icon-sort-asc.svg";
import iconSortDefault from "~/assets/icons/icon-sort-default.svg";
import iconSortDesc from "~/assets/icons/icon-sort-desc.svg";

import Box from "~/components/Box";
import IconButton from "~/components/IconButton";

import { TableHeaderProps } from ".";

const sortIcons = {
  default: iconSortDefault,
  asc: iconSortAsc,
  desc: iconSortDesc,
};

const Wrapper = styled(Box)`
  width: auto;
  min-width: 100%;
  height: auto;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 14px 20px;
  gap: 20px;

  & > div {
    width: 200px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    & > img {
      vertical-align: middle;
    }
  }
`;

function TableHeader<R extends object>({
  columns,
  sort,
  onSortChange,
}: TableHeaderProps<R>) {
  return (
    <Wrapper>
      {columns.map((column, index) => {
        const key =
          column.key === "none" ? `none ${index}` : column.key.toString();
        return (
          <div key={key} style={{ width: column.width }}>
            {column.label}
            {column.hasSort ? (
              <IconButton
                css={css`
                  vertical-align: middle;
                `}
                size={22}
                icons={{
                  default:
                    sort?.key === column.key
                      ? sortIcons[sort.direction]
                      : sortIcons.default,
                }}
                onClick={() =>
                  onSortChange &&
                  column.key !== "none" &&
                  onSortChange(
                    column.key,
                    sort?.key === column.key && sort.direction === "asc"
                      ? "desc"
                      : "asc",
                  )
                }
              />
            ) : undefined}
          </div>
        );
      })}
    </Wrapper>
  );
}

export default TableHeader;
