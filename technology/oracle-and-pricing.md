---
description: How collateral prices are sourced and what protects the protocol from manipulation.
---

# Oracle and pricing

When a borrower opens a loan, the protocol needs to know how much their collateral is worth at that exact moment. That value determines the loan amount, the buyback cost, and the buffer available to lenders. Getting this price right matters. Getting it wrong, in either direction, harms one side of the trade.

Based Loans uses multiple independent price sources and requires the configured minimum to agree before a loan can open. Most assets combine a Pyth feed and a DEX TWAP, and many now add a DIA feed as a third source. Some assets use a single TWAP source where no external feed exists. The minimum source requirement is configured per asset by the protocol operator. This design is a structural defence against the most common class of DeFi exploit: oracle manipulation.

***

## Source 1: Pyth network

[Pyth](https://pyth.network) is a decentralised price oracle that aggregates data from professional market participants including trading firms, exchanges, and market makers. Pyth prices are published directly on-chain at high frequency and represent a consensus view of the current market price drawn from participants with direct access to real trading data.

Pyth is well suited to capturing the current spot price of a token across multiple venues simultaneously. A single large trade on one DEX does not move a Pyth price. Because contributors must stake to publish and their data is aggregated across many independent sources, manipulating a Pyth feed requires coordinating across a large number of independent contributors at once.

The Pyth oracle contract on Base is at [0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a](https://basescan.org/address/0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a). Based Loans interacts with it through a protocol-owned Pyth adapter at [0x85Ad3d6817646143e7076096D4A053ED38eFc958](https://basescan.org/address/0x85Ad3d6817646143e7076096D4A053ED38eFc958).

***

## Source 2: TWAP from a V3-compatible DEX pool

A TWAP, or time-weighted average price, is not the current price of a token. It is the average price over a recent time window, calculated from the recorded price history of a DEX liquidity pool. Rather than reading the price at a single block, the TWAP reads where the price has been over a period of time and averages it.

This matters for security. A flash loan or a single large trade can move the spot price of a token dramatically within one transaction. That same trade cannot move the TWAP, because the TWAP reflects accumulated price history, not the current tick. An attacker would need to sustain a manipulated price across many blocks, incurring real holding costs, to meaningfully shift the TWAP.

Based Loans supports two types of V3-compatible pool for TWAP reads: UniswapV3-style pools and Algebra-style pools. The protocol treats them consistently regardless of which DEX they run on. The relevant adapters are at [0xfcDafF6e23d22d430A19aabDefDb9B2Aa2975ba2](https://basescan.org/address/0xfcDafF6e23d22d430A19aabDefDb9B2Aa2975ba2) (UniswapV3) and [0x218CDFd5802fF3d6a22ffB14A41C3311EBfc2908](https://basescan.org/address/0x218CDFd5802fF3d6a22ffB14A41C3311EBfc2908) (Algebra).

***

## Source 3: DIA network

[DIA](https://www.diadata.org) is an oracle network that publishes asset prices on-chain using a push model. Rather than being read on demand, DIA feeders write the latest price to a feed contract whenever the price moves beyond a set threshold or a maximum time interval, its heartbeat, has elapsed. The most recent published value is then held on-chain for the protocol to read.

Based Loans uses DIA as an additional corroborating source on assets where a DIA feed is available, alongside the Pyth feed and the DEX TWAP. Because it is gathered and published independently of both, it strengthens the multi-source check: an attacker trying to push a price past the deviation threshold would have to move every configured source at once, not just one.

The protocol reads DIA through a protocol-owned DIA adapter at [0x6E1b8594546220C456Ad2721fbC298D761Ed60Db](https://basescan.org/address/0x6E1b8594546220C456Ad2721fbC298D761Ed60Db). The adapter validates every reading before it is used: it rejects a price that is zero, unset, future-dated, or older than the staleness bound configured for that feed, and it normalises the feed's decimals to the protocol's internal format. The underlying DIA oracle contract on Base is at [0x6FFFaF02Afa42244c10B27097cB0588D9868cc98](https://basescan.org/address/0x6FFFaF02Afa42244c10B27097cB0588D9868cc98).

***

## Source 4: Ratio-derived pricing

Some collateral assets do not have their own DEX pool or Pyth feed. Instead, their value is defined by a known relationship to another token that is already priced by the protocol. The ratio-derived adapter handles these cases.

It works in two modes:

**Fixed ratio.** The protocol operator configures a fixed multiplier in AssetManager. The adapter applies that multiplier to the base token's current price. For example, esALB is configured at 85% of ALB's price, reflecting a governance-set discount for the escrowed form of the token. The ratio is set and updated by the operator multisig, not read from an external contract.

**On-chain ratio.** For assets such as liquid staking tokens, the adapter calls a view function on a designated contract to read the current conversion rate, then multiplies it against the base token's price. This allows the price to track the live exchange rate between the derived token and its underlying.

In both modes, the base token must be independently configured in AssetManager with its own oracle sources. The derived token inherits its price from the base token's fully validated, multi-source price at the time of the loan open.

The ratio-derived adapter is deployed at [0xB539...8b52](https://basescan.org/address/0xB5391e137cd3Bb9dda02c164B599c95Af0F88b52).

***

## How the sources are combined

The OracleManager reads all configured sources at the moment a loan open transaction is processed. If all sources return a price and the readings are within an acceptable range of each other, the protocol uses their combined reading to determine the collateral value and the resulting loan amount.

The loan cannot open if any of the following conditions apply:

* A required source is unavailable (stale Pyth feed, pool with insufficient cardinality, or missing oracle configuration for the asset).
* Sources return prices that diverge beyond the acceptable threshold, suggesting one has been temporarily pushed away from fair value.

A successful loan open is evidence that all configured pricing mechanisms agreed on the value of the collateral within a narrow band at that moment.

{% hint style="info" %}
If a loan fails to open due to an oracle check, you will see an error message in the interface. In most cases, retrying after a short delay will resolve it as prices update or settle. If the failure persists, it may indicate an issue with liquidity or feed availability for that specific token.
{% endhint %}

***

## Price is locked at loan open, not tracked during the loan

Once a loan opens successfully, the price used for that loan is frozen. The protocol does not monitor collateral prices during the loan period. It does not check whether the token has fallen or risen. It does not revalue the position.

This is deliberate. It is the property that eliminates liquidations from the model entirely. Because there is no floating ratio to breach, there is nothing to liquidate. The only two outcomes are the borrower choosing to buy back at the agreed price, or the borrower allowing the loan to expire and the lender claiming the collateral.

The price oracle does its job once at loan open and then steps aside. Everything that follows is governed by the terms agreed in that opening transaction.

***

## Summary

* Most assets use two or more independent price sources: a Pyth feed, a DEX TWAP, and where available a DIA feed. Some assets use a single TWAP source where no external feed exists.
* Pyth represents current consensus price across professional market participants.
* The TWAP represents average price over recent time, making it resistant to single-block manipulation.
* DIA is an independently sourced push oracle that adds a third corroborating price on supported assets.
* All configured sources must be available and agree within a threshold for the loan to open.
* If any required source fails or prices diverge significantly, the loan is blocked.
* Once a loan opens, the price is locked permanently for that loan. No mid-loan price tracking occurs.
* Using multiple independent sources means manipulating the oracle requires attacking all of them simultaneously.
