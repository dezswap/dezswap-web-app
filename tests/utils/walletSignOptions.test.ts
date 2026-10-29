import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Exercise the store used by ChainProvider, including its transitive core copy.
const require = createRequire(import.meta.url);
const requireFromReact = createRequire(
  require.resolve("@interchain-kit/react"),
);
const { ChainWalletStore } = requireFromReact(
  "@interchain-kit/store/wallet-manager/chain-wallet-store",
);
const requireFromStore = createRequire(
  requireFromReact.resolve("@interchain-kit/store"),
);
const { CosmosWallet } = requireFromStore("@interchain-kit/core");

describe("ChainProvider wallet signing options", () => {
  it.each([
    { signType: "direct", isNanoLedger: false, method: "signDirect" },
    { signType: "amino", isNanoLedger: false, method: "signAmino" },
    { signType: "direct", isNanoLedger: true, method: "signAmino" },
  ])(
    "preserves configured options for $method (Ledger: $isNanoLedger)",
    async ({ signType, isNanoLedger, method }) => {
      const account = { address: "xpla1fixture", isNanoLedger };
      const sign = vi.fn().mockResolvedValue({ signed: {} });
      const wallet = new CosmosWallet({ name: "keplr-extension" });
      const options = {
        preferNoSetFee: true,
        preferNoSetMemo: false,
        disableBalanceCheck: true,
      };
      wallet.setSignOptions(options);
      wallet.client = { [method]: sign };

      const chainWallet = new ChainWalletStore(
        wallet,
        { chainName: "xplatestnet", chainId: "cube_47-5" },
        { getChainWalletState: () => ({ account }) },
        { getPreferSignType: () => signType },
      );
      const signer = await chainWallet.getOfflineSigner();
      const signDoc = { fee: { amount: [], gas: "285781" } };

      await signer[method](account.address, signDoc);

      expect(sign).toHaveBeenCalledWith(
        "cube_47-5",
        account.address,
        signDoc,
        options,
      );
    },
  );
});
