import { css } from "@emotion/react";
import styled from "@emotion/styled";
import HoverUnderline from "components/utils/HoverUnderline";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import useModal from "hooks/useModal";
import useNetwork from "hooks/useNetwork";
import Expand from "pages/Earn/Expand";
import { useMemo } from "react";
import { DashboardTransaction } from "types/dashboard-api";
import {
  ellipsisCenter,
  getAddressLink,
  getFromNow,
  getTransactionLink,
} from "utils";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import AssetValueFormatter from "components/utils/AssetValueFormatter";

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
  const {
    selectedChain: { explorers },
  } = useNetwork();
  const expand = useModal();
  const { assetInfos } = useAssets();

  const [asset0, asset1] = useMemo(() => {
    return [transaction.asset0, transaction.asset1].map((address) => {
      return assetInfos?.[address];
    });
  }, [assetInfos, transaction.asset0, transaction.asset1]);

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
                href={getTransactionLink(transaction.hash, explorers?.[0]?.url)}
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
                <Value>
                  <CurrencyFormatter value={transaction.totalValue} />
                </Value>
              </div>
              <div>
                <Label>Token Amount</Label>
                <Value>
                  <AssetValueFormatter
                    asset={asset0}
                    amount={transaction.asset0amount}
                  />
                </Value>
              </div>
              <div>
                <Label>Token Amount</Label>
                <Value>
                  <AssetValueFormatter
                    asset={asset1}
                    amount={transaction.asset1amount}
                  />
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
