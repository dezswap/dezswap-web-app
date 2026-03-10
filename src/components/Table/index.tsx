import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

import Typography from "~/components/Typography";

import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "~/constants/layout";

import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

export type TableColumn<R extends object, K extends keyof R = keyof R> = {
  key: K | "none";
  label: React.ReactNode;
  width?: React.CSSProperties["width"];
  flex?: React.CSSProperties["flex"];
  cellStyle?: React.CSSProperties;
  render?: (
    value: R[K] | null | undefined,
    row: R,
    index: number,
  ) => React.ReactNode;
  hasSort?: boolean;
};
export type TableSortDirection = "asc" | "desc";

export interface TableHeaderProps<R extends object> {
  columns: TableColumn<R>[];
  sort?: {
    key: keyof R;
    direction: TableSortDirection;
  };
  onSortChange?: (key: keyof R, direction: TableSortDirection) => void;
}

export interface TableProps<R extends object> {
  columns: TableColumn<R>[];
  data: R[];
  renderRow?: (row: R, index: number) => React.ReactNode;
  sort?: TableHeaderProps<R>["sort"];
  onSortChange?: TableHeaderProps<R>["onSortChange"];
  minWidth?: React.CSSProperties["minWidth"];
  idKey?: keyof R | (keyof R)[];
  hideHeader?: boolean;

  rowAnchorProps?:
    | ((
        row: R,
      ) => React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >)
    | React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >;
  onRowClick?: (
    row: R,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;

  emptyMessage?: React.ReactNode;

  // TODO: Add loading state
  // isLoading?: boolean;
}

const Wrapper = styled.div`
  display: block;
  width: 100%;
  height: auto;
  position: relative;

  overflow-x: auto;
  overflow-y: hidden;

  & > div {
    width: 100%;
    height: auto;
    min-width: 100%;
  }
`;

const TableRowWrapper = styled.div`
  width: 100%;
  min-width: 100%;
  height: auto;
  position: relative;
  min-height: 182px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  row-gap: 10px;
  padding-top: 10px;

  & > a {
    display: block;
    min-width: 100%;
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    min-height: 78px;
  }
`;

function Table<R extends object>({
  columns,
  data,
  renderRow,
  sort,
  onSortChange,
  minWidth = "100%",
  idKey,
  hideHeader = false,
  rowAnchorProps,
  onRowClick,
  emptyMessage = "No data",
}: TableProps<R>) {
  return (
    <Wrapper>
      <div style={{ minWidth }}>
        {!hideHeader && (
          <TableHeader
            columns={columns}
            onSortChange={onSortChange}
            sort={sort}
          />
        )}

        <TableRowWrapper style={{ minWidth }}>
          {!data.length && (
            <div
              css={css`
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 100%;
                height: auto;
              `}
            >
              <Typography
                css={css`
                  text-align: center;
                  opacity: 0.3;
                `}
                size={20}
                weight={900}
              >
                {emptyMessage}
              </Typography>
            </div>
          )}
          {data.map((row, index) => {
            const keys = Array.isArray(idKey) ? idKey : [idKey];
            const key = keys?.map((k) => (k ? row[k] : undefined)).join("-");

            const res = renderRow ? (
              renderRow(row, index)
            ) : (
              <TableRow
                row={row}
                columns={columns}
                index={index}
                onClick={
                  onRowClick
                    ? (event) => {
                        onRowClick(row, event);
                      }
                    : undefined
                }
              />
            );

            return (
              <React.Fragment key={key}>
                {rowAnchorProps ? (
                  <a
                    {...(typeof rowAnchorProps === "function"
                      ? rowAnchorProps(row)
                      : rowAnchorProps)}
                  >
                    {res}
                  </a>
                ) : (
                  res
                )}
              </React.Fragment>
            );
          })}
        </TableRowWrapper>
      </div>
    </Wrapper>
  );
}

export default Table;
