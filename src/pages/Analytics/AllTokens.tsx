import { css } from "@emotion/react";
import { useQuery } from "@tanstack/react-query";
import AssetIcon from "components/AssetIcon";
import Input from "components/Input";
import Pagination from "components/Pagination";
import Panel from "components/Panel";
import Table from "components/Table";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { useEffect, useMemo, useState } from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import MobileTokenItem from "./MobileTokenItem";

const LIMIT = 10;

function AllTokens() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const network = useNetwork();
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");

  const api = useAPI();

  const { data: tokens } = useQuery({
    queryKey: ["all-tokens", network.name],
    queryFn: api.getTokens,
  });

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    return tokens.filter((token) => {
      if (!searchKeyword) return true;
      return (
        token.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        token.token.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });
  }, [searchKeyword, tokens]);

  const tokensToDisplay = useMemo(() => {
    return filteredTokens.slice((page - 1) * LIMIT, page * LIMIT);
  }, [filteredTokens, page]);

  useEffect(() => {
    setPage(1);
  }, [filteredTokens]);

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        css={css`
          margin-bottom: 10px;
        `}
      >
        <Col xs={12} sm="content">
          <Typography size={20} weight={900} color="primary">
            All Tokens
          </Typography>
        </Col>
        <Col xs={12} sm={6}>
          <div
            css={css`
              width: 100%;
              max-width: 440px;
              margin-left: auto;
            `}
          >
            <Input
              size="large"
              variant="primary"
              align="left"
              height={50}
              style={{ fontSize: "16px", fontWeight: "bold" }}
              css={css`
                &::placeholder {
                  text-align: center !important;
                }
                &:focus::placeholder {
                  opacity: 0;
                }
              `}
              borderStyle="solid"
              placeholder="Search name or paste address"
              onChange={(event) => {
                setSearchKeyword(event.target.value);
              }}
            />
          </div>
        </Col>
      </Row>
      <div
        css={css`
          margin-bottom: 25px;
        `}
      >
        {isSmallScreen ? (
          <Table
            columns={[]}
            hideHeader
            renderRow={(asset, index) => (
              <MobileTokenItem
                number={(page - 1) * LIMIT + index + 1}
                asset={asset}
              />
            )}
            data={tokensToDisplay}
          />
        ) : (
          <Table
            columns={[
              {
                key: "none",
                label: "#",
                width: 10,
                hasSort: false,
                render(value, row, index) {
                  return (
                    <Typography>{(page - 1) * LIMIT + index + 1}</Typography>
                  );
                },
              },
              {
                key: "name",
                label: "Token",
                width: 289,
                hasSort: false,
                render(name, row) {
                  return (
                    <Row
                      justify="start"
                      align="center"
                      gutterWidth={10}
                      css={css`
                        margin: 0 !important;
                      `}
                    >
                      <Col xs="content">
                        <AssetIcon asset={{ icon: row.icon }} />
                      </Col>
                      <Col width={190}>
                        <div
                          css={css`
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                          `}
                        >
                          <div
                            css={css`
                              white-space: nowrap;
                              word-break: break-all;
                              text-overflow: ellipsis;
                              overflow: hidden;
                            `}
                          >
                            {name}&nbsp;
                          </div>
                          {row.symbol && (
                            <Typography
                              size={16}
                              weight={500}
                              css={css`
                                opacity: 0.7;
                                display: inline-block;
                              `}
                            >
                              ({row.symbol})
                            </Typography>
                          )}
                        </div>
                      </Col>
                    </Row>
                  );
                },
              },
              {
                key: "none",
                label: "Price",
                width: 170,
                hasSort: true,
                render() {
                  return `$TBD`;
                },
              },
              {
                key: "none",
                label: "Price Change",
                width: 170,
                hasSort: true,
                render() {
                  return (
                    <Typography size={16} weight={900} color="positive">
                      ↑TBD%
                    </Typography>
                  );
                },
              },
              {
                key: "none",
                label: "Volume 24H",
                width: 170,
                hasSort: true,
                render() {
                  return `$TBD`;
                },
              },
              {
                key: "none",
                label: "TVL",
                width: 170,
                hasSort: true,
                render() {
                  return `$TBD`;
                },
              },
            ]}
            data={tokensToDisplay}
          />
        )}
      </div>
      {filteredTokens && filteredTokens.length > LIMIT && (
        <Pagination
          current={page}
          total={Math.ceil(filteredTokens.length / LIMIT)}
          onChange={(newPage) => setPage(newPage)}
        />
      )}
    </Panel>
  );
}

export default AllTokens;
