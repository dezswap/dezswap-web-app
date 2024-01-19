import { css } from "@emotion/react";
import styled from "@emotion/styled";
import HoverUnderline from "components/HoverUnderline";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import useModal from "hooks/useModal";
import useNetwork from "hooks/useNetwork";
import Expand from "pages/Earn/Expand";
import React, { useMemo } from "react";
import { DashboardTransaction } from "types/dashboard-api";
import {
  amountToValue,
  ellipsisCenter,
  formatCurrency,
  formatNumber,
  getAddressLink,
  getFromNow,
  getTransactionLink,
} from "utils";

interface MobileTransactionItemProps {
  transaction: DashboardTransaction;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  flex: 1;
`;

const Label = styled(Typography)`
  margin-bottom: 6px;
`;
Label.defaultProps = {
  color: "primary",
  size: 14,
  weight: 900,
};

const Value = styled(Typography)``;
Value.defaultProps = {
  color: "primary",
  size: 16,
  weight: 500,
};

function MobileTransactionItem({ transaction }: MobileTransactionItemProps) {
  const network = useNetwork();
  const expand = useModal();
  const { getAsset } = useAssets();

  const [asset0, asset1] = useMemo(() => {
    return [transaction.asset0, transaction.asset1].map((address) => {
      return getAsset(address);
    });
  }, [getAsset, transaction.asset0, transaction.asset1]);

  return (
    <Expand
      isOpen={expand.isOpen}
      onHeaderClick={() => expand.toggle()}
      hasDivider={false}
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Transaction</Label>
            <Value>
              <a
                href={getTransactionLink(transaction.hash, network.name)}
                target="_blank"
                rel="noreferrer noopener"
              >
                <HoverUnderline>{transaction.actionDisplay}</HoverUnderline>
              </a>
            </Value>
          </div>
          {expand.isOpen && (
            <>
              <div>
                <Label>Total Value</Label>
                <Value>{formatCurrency(transaction.totalValue)}</Value>
              </div>
              <div>
                <Label>Token Amount</Label>
                <Value>
                  {formatNumber(
                    amountToValue(
                      `${transaction.asset0amount}`,
                      asset0?.decimals,
                    ) || "",
                  )}
                  &nbsp;{asset0?.symbol}
                </Value>
              </div>
              <div>
                <Label>Token Amount</Label>
                <Value>
                  {formatNumber(
                    amountToValue(
                      `${transaction.asset1amount}`,
                      asset1?.decimals,
                    ) || "",
                  )}
                  &nbsp;{asset1?.symbol}
                </Value>
              </div>
              <div>
                <Label>Account</Label>
                <Value>
                  <HoverUnderline>
                    <a
                      href={getAddressLink(transaction.account)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {ellipsisCenter(transaction.account, 6)}
                    </a>
                  </HoverUnderline>
                </Value>
              </div>
            </>
          )}
          <div>
            <Label>Time</Label>
            <Value>{getFromNow(transaction.timestamp)}</Value>
          </div>
        </Content>
      }
    >
      <div />
    </Expand>
  );
}

export default MobileTransactionItem;
