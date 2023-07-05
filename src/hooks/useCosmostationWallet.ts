import { cosmos, InstallError } from "@cosmostation/extension-client";
import {
  ConnectType,
  TxFailed,
  TxResult,
  WalletStatus,
  useWallet,
} from "@xpla/wallet-provider";
import { BaseAccount, CreateTxOptions, Fee } from "@xpla/xpla.js";
import networks from "constants/network";
import { useCallback, useEffect, useMemo } from "react";
import { SEND_TRANSACTION_MODE } from "@cosmostation/extension-client/cosmos";
import {
  getAuthInfoBytes,
  getTxBodyBytes,
  protoTxBytes,
} from "utils/cosmostation-helpers";
import { useAtom } from "jotai";
import { cosmostationAtom } from "stores/cosmostation";
import { useLCDClient } from "./useLCDClient";

// TODO: support testnet
const CHAIN_ID = networks.dimension.chainId;

const useCosmostationWallet = () => {
  // const [provider, setProvider] = useState<Cosmos>();
  // const [account, setAccount] = useState<RequestAccountResponse>();
  const [cosmostationWallet, setCosmostationWallet] = useAtom(cosmostationAtom);
  const lcd = useLCDClient();
  const xplaWallet = useWallet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isInstalled = !!(window as any).cosmostation;

  const connect = useCallback(async () => {
    try {
      const provider = await cosmos();

      const account = await provider.requestAccount(CHAIN_ID);

      setCosmostationWallet({
        provider,
        account,
      });

      if (account) {
        xplaWallet.connectReadonly(account.address, xplaWallet.network);
      }

      return;
    } catch (e) {
      if (e instanceof InstallError) {
        console.log("not installed");
      }
    }
    setCosmostationWallet(undefined);
  }, [setCosmostationWallet, xplaWallet]);

  const disconnect = useCallback(async () => {
    xplaWallet.disconnect();
    if (cosmostationWallet?.provider) {
      cosmostationWallet.provider.disconnect();
    }
    setCosmostationWallet(undefined);
  }, [cosmostationWallet, setCosmostationWallet, xplaWallet]);

  useEffect(() => {
    if (xplaWallet.status === WalletStatus.WALLET_NOT_CONNECTED) {
      disconnect();
    }
  }, [xplaWallet, disconnect]);

  const post = useCallback(
    async (txOptions: CreateTxOptions, fee: Fee) => {
      if (!(cosmostationWallet?.provider && cosmostationWallet?.account)) {
        throw new Error("Not connected");
      }
      try {
        const { account_number: accountNumber, sequence } =
          (await lcd.auth.accountInfo(
            cosmostationWallet.account.address,
          )) as BaseAccount;

        const signRes = await cosmostationWallet.provider.signAmino(
          CHAIN_ID,
          {
            chain_id: CHAIN_ID,
            fee: fee.toAmino(),
            memo: "",
            msgs: txOptions.msgs.map((msg) => msg.toAmino(false)),
            sequence: `${sequence}`,
            account_number: `${accountNumber}`,
          },
          // {
          //   fee: true,
          // },
        );

        const authInfoBytes = getAuthInfoBytes(
          signRes.signed_doc,
          cosmostationWallet.account.publicKey,
        );
        const txBodyBytes = getTxBodyBytes(signRes.signed_doc);
        if (!authInfoBytes || !txBodyBytes) {
          throw new Error("Unknown error");
        }

        const res = await cosmostationWallet.provider.sendTransaction(
          CHAIN_ID,
          protoTxBytes({
            signature: signRes.signature,
            authInfoBytes,
            txBodyBytes,
          }).tx_bytes,
          SEND_TRANSACTION_MODE.SYNC,
        );

        const result = {
          ...txOptions,
          result: {
            height: Number(res.tx_response.height),
            raw_log: `${res.tx_response.raw_log}`,
            txhash: res.tx_response.txhash,
          },
          success: res.tx_response.code === 0,
        } as TxResult;

        if (result.success) {
          return result;
        }
        throw new TxFailed(
          txOptions,
          res.tx_response.txhash,
          result.result.raw_log,
          result.result.raw_log,
        );
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any)?.message) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error((error as any)?.message || error);
        }
        throw new Error("Unknown error");
      }
    },
    [cosmostationWallet, lcd.auth],
  );

  useEffect(() => {
    if (cosmostationWallet?.provider) {
      cosmostationWallet.provider.onAccountChanged(() => {
        disconnect();
      });
    }
  }, [cosmostationWallet, disconnect]);

  useEffect(() => {
    if (
      // If the user is connected to the wallet, but read-only
      xplaWallet.status === WalletStatus.WALLET_CONNECTED &&
      xplaWallet.connection?.type === ConnectType.READONLY
    ) {
      connect();
    }

    if (xplaWallet.status === WalletStatus.WALLET_NOT_CONNECTED) {
      disconnect();
    }
    // Only execute once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({ connect, post, disconnect, isInstalled, ...cosmostationWallet }),
    [connect, post, disconnect, isInstalled, cosmostationWallet],
  );
};

export default useCosmostationWallet;
