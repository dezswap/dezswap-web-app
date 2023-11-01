import Box from "components/Box";
import styled from "@emotion/styled";
import { TableColumn } from ".";

interface TableRowProps<R extends object> {
  row: R;
  columns: TableColumn<R>[];
  index: number;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Wrapper = styled(Box)`
  min-width: 100%;
  width: auto;
  height: auto;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 20px;
  gap: 20px;

  & > div {
    position: relative;
    width: 200px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;
  }
`;

function TableRow<R extends object>({
  row,
  columns,
  index,
  onClick,
}: TableRowProps<R>) {
  return (
    <Wrapper onClick={onClick}>
      {columns.map((column, columnIndex) => {
        const key =
          column.key === "none" ? `none ${columnIndex}` : column.key.toString();
        const value = column.key !== "none" ? row[column.key] : null;
        const width =
          typeof column.width === "number" ? `${column.width}px` : column.width;
        const flex = column.flex ?? `0 0 ${width}`;

        return (
          <div key={key} style={{ width, flex }}>
            {column.render ? column.render(value, row, index) : String(value)}
          </div>
        );
      })}
    </Wrapper>
  );
}

export default TableRow;