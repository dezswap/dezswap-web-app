import { css } from "@emotion/react";
import styled from "@emotion/styled";

import iconBack from "~/assets/icons/icon-back.svg";

import IconButton from "~/components/IconButton";
import Typography from "~/components/Typography";

interface PaginationProps {
  total: number;
  current: number;
  onChange?: (page: number) => void;
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

function Pagination({ total = 1, current = 1, onChange }: PaginationProps) {
  return (
    <Wrapper>
      <IconButton
        icons={{
          default: iconBack,
        }}
        size={28}
        title="Previous"
        disabled={current <= 1}
        onClick={() => onChange && onChange(current - 1)}
      />
      <Typography color="primary" size={16} weight={500}>
        {current} / {total}
      </Typography>
      <IconButton
        icons={{
          default: iconBack,
        }}
        size={28}
        css={css`
          transform: rotate(-180deg);
        `}
        title="Next"
        disabled={current >= total}
        onClick={() => onChange && onChange(current + 1)}
      />
    </Wrapper>
  );
}

export default Pagination;
