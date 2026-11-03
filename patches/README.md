# Dependency patches

## `@chain-registry/v2@1.71.237`

Backports the gas-price changes from [cosmos/chain-registry#8078](https://github.com/cosmos/chain-registry/pull/8078) while waiting for an npm release. Both CommonJS and ESM data are patched:

- XPLA mainnet: `10000000000000axpla` per gas.
- XPLA testnet: `1200000000000axpla` per gas.

Remove the patch with `pnpm patch-remove @chain-registry/v2@1.71.237` once a compatible published package includes the corrected values, then update the dependency and lockfile. Verify the published data and run the registry fee tests before removing this workaround.

The planned mainnet reduction to `1200000000000axpla` should only be applied after the chain change takes effect.

## `@interchain-kit/store@0.9.2`

Preserves wallet signing options in `ChainWalletStore.getOfflineSigner`. Its Direct and Amino adapters pass an explicit empty options object, which masks `CosmosWallet.defaultSignOptions`, including `preferNoSetFee: true`. Keplr consequently recalculates the fee using its own chain settings instead of preserving the app's fee.

The patch omits that argument in both CommonJS and ESM builds so the wallet's configured defaults apply. Remove it after upgrading to a version that preserves these options, and run `tests/utils/walletSignOptions.test.ts` before removing the workaround.
