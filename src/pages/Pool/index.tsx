import Hr from "components/Hr";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Col, Container, Row } from "react-grid-system";
import { Outlet } from "react-router-dom";

import iconPlus from "assets/icons/icon-plus.svg";
import { css } from "@emotion/react";
import Pagination from "components/Pagination";
import TabButton from "components/TabButton";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import usePairs from "hooks/usePair";
import { useAPI } from "hooks/useAPI";
import { Pool } from "types/pair";
import { PairExtended } from "types/common";
import Select from "./Select";
import PoolButton from "./PoolButton";
import PoolList from "./PoolList";

const timeBaseOptions = ["24h", "7d", "1m"];

const HeaderSection = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  column-gap: 58px;

  & > div {
    flex: 1;
  }
`;

export type PoolWithPair = Pool & { pair: PairExtended };

function PoolPage() {
  const [selectedTimeBase, setSelectedTimeBase] = useState(timeBaseOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { pairs } = usePairs();
  const { getPool } = useAPI();
  const [pools, setPools] = useState<PoolWithPair[]>([]);
  useEffect(() => {
    let isAborted = false;
    const fetchPools = async () => {
      if (pairs) {
        const res = await Promise.all(
          pairs.map(async (pair) => {
            if (isAborted) {
              return undefined;
            }
            const pool = await getPool(pair.contract_addr);
            return { ...pool, pair };
          }),
        );
        if (!isAborted) {
          setPools(res.filter((pool) => pool) as PoolWithPair[]);
        }
      }
    };
    fetchPools();
    return () => {
      isAborted = true;
    };
  }, [getPool, pairs]);

  useEffect(() => {
    console.log("pools");
    console.log(pools);
  }, [pools]);
  return (
    <>
      <Container>
        <Typography
          size={32}
          color="primary"
          weight={900}
          css={css`
            margin-bottom: 19px;
          `}
        >
          Pool
        </Typography>
        <Hr
          css={css`
            margin-bottom: 20px;
          `}
        />
        <HeaderSection
          css={css`
            margin-bottom: 20px;
          `}
        >
          <div>
            <Row
              justify="between"
              align="center"
              gutterWidth={44}
              css={css`
                background-image: url(${iconPlus});
                background-repeat: no-repeat;
                background-position: 50% 50%;
                background-size: 24px 24px;
              `}
            >
              <Col xs={12} sm={6}>
                <PoolButton variant="default">&nbsp;</PoolButton>
              </Col>
              <Col xs={12} sm={6}>
                <PoolButton variant="default">&nbsp;</PoolButton>
              </Col>
            </Row>
          </div>
          <div
            css={css`
              max-width: 300px;
            `}
          >
            <PoolButton variant="gradient">Create a new pool</PoolButton>
          </div>
        </HeaderSection>

        <Panel shadow>
          <Row
            justify="between"
            align="center"
            css={css`
              gap: 20px;
              margin-bottom: 25px;
            `}
          >
            <Col xs={12} sm={6}>
              <div
                css={css`
                  max-width: 274px;
                  .${MOBILE_SCREEN_CLASS} & {
                    max-width: unset;
                  }
                `}
              >
                <TabButton
                  size="large"
                  items={["Liquidity pools", "My pools"].map((item) => ({
                    value: item,
                    label: item,
                    key: item,
                  }))}
                  defaultSelectedIndex={0}
                />
              </div>
            </Col>
            <Col xs={12} sm="content">
              <Row align="center" justify="center" gutterWidth={8}>
                <Col xs="content">
                  <Typography color="primary" size={14} weight={900}>
                    Time base
                  </Typography>
                </Col>
                <Col xs="content">
                  <Select
                    options={timeBaseOptions.map((value) => ({
                      value,
                      label: value.toUpperCase(),
                    }))}
                    onChange={(value) => setSelectedTimeBase(`${value}`)}
                    value={selectedTimeBase}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <div
            css={css`
              margin-bottom: 25px;
            `}
          >
            <PoolList pools={pools} />
          </div>

          <Pagination
            current={currentPage}
            total={Math.floor(pools.length - 1 / 8) + 1}
            onChange={(value) => {
              setCurrentPage(value);
            }}
          />
        </Panel>
      </Container>
      <Outlet />
    </>
  );
}

export default PoolPage;
