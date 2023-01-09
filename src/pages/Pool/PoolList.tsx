import styled from "@emotion/styled";
import Box from "components/Box";

import { useNetwork } from "hooks/useNetwork";
import { PoolWithPair } from ".";
import PoolItem from "./PoolItem";

interface PoolListProps {
  pools: PoolWithPair[];
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* overflow-x: auto;
  & > div {
    width: auto;
    min-width: 100%;
  } */
`;

const TableHeader = styled(Box)`
  /* width: auto;
  min-width: 100%; */
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 14px 20px;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    &:first-of-type {
      width: 244px;
    }
  }
`;

function PoolList({ pools }: PoolListProps) {
  return (
    <Wrapper>
      <TableHeader>
        <div>Pool</div>
        <div>Total Liquidity</div>
        <div>Volume(24H)</div>
        <div>Fees(24H)</div>
        <div>APR</div>
      </TableHeader>

      {pools.map((pool) => {
        return <PoolItem pool={pool} />;
      })}
    </Wrapper>
  );
}

export default PoolList;
