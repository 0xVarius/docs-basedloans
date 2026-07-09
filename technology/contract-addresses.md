---
description: Official contract addresses for every Based Loans contract on Base mainnet.
---

# Contract addresses

All Based Loans contracts are deployed on Base mainnet (chainId 8453) and verified on BaseScan. The addresses below are the only official deployments. Always confirm you are interacting with these addresses before approving any transaction.

{% hint style="warning" %}
Never interact with a contract address that is not listed here. Scam deployments often use similar names or claim to be newer versions of official contracts. Based Loans does not publish new contract addresses outside of official channels: the X account [@based\_loans](https://x.com/based_loans) and this documentation.
{% endhint %}

***

## Core protocol contracts

| Contract | Address | Notes |
|---|---|---|
| Core | [0x88Df...1Aa3](https://basescan.org/address/0x88Df29c4c2D564A2996d99bbe3C85da505881Aa3) | Loan lifecycle: open, buyback, and collateral claim at expiry. Entry point for all borrower actions. |
| LendingLedger | [0x278C...141F](https://basescan.org/address/0x278CfeaDeAaCBe88f24692ef199247cF17c5141F) | Holds all lender USDC. Manages deposits, loan matching, and proceeds distribution. |
| AssetManager | [0xA934...1212](https://basescan.org/address/0xA93407aE856Ee3241550292B8A8B7cF8B98b1212) | Stores collateral configuration per asset: LTV ratios, oracle sources, and deposit caps. |
| FeeDistributor | [0x754D...19e5](https://basescan.org/address/0x754D694d81C96D134cd33f3F164bb1084Df019e5) | Collects protocol fees from every loan and routes them across three distribution tiers. |
| AutoBurnSplitter | [0x10Cf...56a4](https://basescan.org/address/0x10CfdBed46960370b45686CF58BaBd67E4d656a4) | Receives the burn-tier fee and splits it between MONSTRO buyback/burns and the mUSDC vault. Immutable. |

***

## Tokens

| Token | Address | Notes |
|---|---|---|
| USDC | [0x8335...2913](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) | Native USDC on Base, issued by Circle. The only accepted settlement currency for loans, deposits, and buybacks. |
| mUSDC | [0xfA68...0397](https://basescan.org/address/0xfA68Ac5cA298aB4B96bCE6542ec74bB9516b0397) | Monstro DAO yield-bearing USDC vault. Idle lender USDC is automatically deposited here to earn passive yield between loans. |

***

## Oracle infrastructure

These contracts handle collateral pricing at loan open. They are called automatically by the Core contract and do not require direct interaction from users.

| Contract | Address | Notes |
|---|---|---|
| OracleManager | [0xeAbD...8C17](https://basescan.org/address/0xeAbD8B03aC04Dfe8b31ADD7f0f760462FD6A8C17) | Aggregates all configured price sources for each asset and enforces the multi-source check at loan open. |
| Uniswap V3 TWAP adapter | [0xfcDa...5ba2](https://basescan.org/address/0xfcDafF6e23d22d430A19aabDefDb9B2Aa2975ba2) | Pulls time-weighted average prices from Uniswap V3-compatible DEX pools. |
| Algebra TWAP adapter | [0x218C...2908](https://basescan.org/address/0x218CDFd5802fF3d6a22ffB14A41C3311EBfc2908) | Pulls time-weighted average prices from Algebra-compatible DEX pools. |
| Pyth adapter | [0x85Ad...c958](https://basescan.org/address/0x85Ad3d6817646143e7076096D4A053ED38eFc958) | Reads and validates Pyth Network price feeds for assets with a configured Pyth feed ID. |
| DIA adapter | [0x6E1b...60Db](https://basescan.org/address/0x6E1b8594546220C456Ad2721fbC298D761Ed60Db) | Reads and validates DIA push-oracle price feeds for assets with a configured DIA feed, enforcing a per-source staleness bound. |
| Ratio-derived adapter | [0xB539...8b52](https://basescan.org/address/0xB5391e137cd3Bb9dda02c164B599c95Af0F88b52) | Prices a token as a fixed or on-chain ratio of a base token. Used for assets such as esALB, which are priced at a governance-set discount to their liquid counterpart. |
| Pyth oracle (Base) | [0x8250...487a](https://basescan.org/address/0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a) | The canonical Pyth oracle contract on Base, maintained by the Pyth Network. |
| DIA oracle (Base) | [0x6FFF...cc98](https://basescan.org/address/0x6FFFaF02Afa42244c10B27097cB0588D9868cc98) | The DIA push oracle contract on Base. Based Loans reads DIA feeds from it through the DIA adapter. |

See [Oracle and pricing](oracle-and-pricing.md) for how these sources are combined per asset.

***

## Governance addresses

| Role | Address | Notes |
|---|---|---|
| DAO contract owner | [0xa673...085C](https://basescan.org/address/0xa673566A818e3525E57292b22311AD0be114085C) | 5-of-7 multisig. Owns all protocol contracts. Controls structural parameters and operator appointment. |
| DAO treasury | [0x4713...8dd0](https://basescan.org/address/0x4713b3ab36C9759043694757E6Cb8123915a8dd0) | Receives the DAO's share of protocol fees. Controlled by Monstro DAO governance. |
| Labs operator | [0x3970...55E5](https://basescan.org/address/0x3970a7372566ad1Fb888a8240A89662A5D2455E5) | 2-of-2 multisig. Day-to-day operations: asset additions, oracle config, and deposit cap management. |

See [Immutability and ownership](immutability-and-ownership.md) for the full breakdown of what each role can and cannot do.

***

## Network details

| Parameter | Value |
|---|---|
| Network | Base |
| Chain ID | 8453 |
| Block explorer | [basescan.org](https://basescan.org) |
| Native gas token | ETH |
