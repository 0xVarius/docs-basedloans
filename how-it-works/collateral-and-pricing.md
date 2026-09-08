---
description: How collateral value is determined and what sets your loan amount.
---

# Collateral and pricing

When you open a loan, the protocol needs to know how much your collateral is worth. That value determines how much USDC you receive and how much it costs to buy your collateral back. This page explains how the protocol calculates that value, why it is locked at loan open, and how the multi-source oracle system works.

***

## How your loan amount is calculated

Based Loans uses a fixed loan-to-value ratio of 50%. This means you receive USDC equal to half the current value of the collateral you deposit.

**Example:** You deposit a token currently priced at $2.00. You deposit 1,000 tokens. The collateral value is $2,000. Your loan amount is $1,000 USDC.

The 50% LTV applies to all collateral tokens equally. There is no negotiation, no tier system, and no adjustment based on token volatility. Every borrower on every supported token starts at 50%. The contracts allow the operator to set a per-asset LTV within hard bounds of 20% to 85%, but the policy is 50% for every listed token.

The logic behind 50% LTV is straightforward. It creates a large enough buffer that lenders can receive collateral tokens at expiry without worrying about whether the protocol has given away too much USDC relative to what they might eventually recover. If a token's price falls 30% during a 45-day loan, the lender still receives collateral worth more than the USDC they lent, even after accounting for the fee they already collected.

***

## Why the price is locked at loan open

Once your loan opens, the collateral price used to calculate your loan is frozen. It does not update during the loan period. This is a deliberate design decision and one of the most important properties of the pawn shop model.

If the price were not locked, the protocol would need some mechanism to respond to price changes. That mechanism is what leads to liquidations in other DeFi lending protocols. Based Loans avoids liquidations entirely by agreeing on the price at the start and holding to it for the duration of the loan.

This has an important implication: the size of your loan and your buyback cost are fully determined before you sign the transaction. You know exactly what you are getting and exactly what it will cost to get your collateral back. Nothing changes unless you choose to make a partial buyback.

***

## The multi-source oracle system

To determine the price of collateral at loan open, Based Loans uses multiple independent price sources and combines them. Using a single price source creates a vulnerability: if that source is temporarily manipulated or goes offline, the protocol would produce incorrect loan amounts. Requiring several independent sources to agree makes that significantly harder.

### Source 1: TWAP (time-weighted average price)

The first source is a TWAP drawn from a V3-compatible DEX pool for the collateral token. A TWAP calculates the average price of a token over a window of recent time rather than using the most recent trade. This makes it resistant to short-term price spikes caused by a single large trade or a flash loan.

The TWAP is read from a decentralised liquidity pool where the collateral token is traded. Based Loans treats all V3-compatible pools consistently, regardless of which DEX protocol they run on.

### Source 2: DIA network

[**DIA**](https://www.diadata.org) is an independent oracle network that publishes prices on-chain using a push model, writing a fresh value whenever the price moves past a set threshold or a maximum time interval elapses. On assets where a DIA feed is available, Based Loans reads it as a second source alongside the TWAP. The protocol rejects any DIA price that is missing or too old before using it.

### How the sources are combined

The protocol reads every configured source at the moment the loan opens. If the required sources are available and agree within a reasonable range, the price used for the loan is derived from their combined reading. If a required source is unavailable or the sources diverge significantly, the loan will not open. This prevents a borrower from exploiting a temporarily stale or manipulated price to extract more USDC than the collateral is actually worth.

{% hint style="info" %}
The oracle check happens automatically when you open a loan. If the oracle check fails for any reason, you will see an error message. In most cases, retrying after a short delay will resolve it as prices update.
{% endhint %}

***

## Supported collateral tokens

Not every token is available as collateral. Lenders configure which tokens they are willing to accept and set a USDC deposit cap per token. If no lender has allocated USDC to a particular token, that token cannot be used as collateral, even if it is listed on the platform.

Each token that is supported has been configured with oracle parameters: which DEX pool to use for the TWAP, and where available which DIA feed to use. These parameters are set at the protocol level and apply to all loans using that token.

***

## Summary

* Your loan amount is 50% of the collateral's value at loan open, applied equally to all tokens.
* The collateral price is read once at loan open and never changes during the loan period.
* Locking the price eliminates the need for liquidations: there is no floating ratio to breach.
* The protocol uses multiple independent price sources: a DEX TWAP and, where available, a DIA feed.
* The required sources must be available and consistent for a loan to open successfully.
* Only tokens configured by lenders with available USDC can be used as collateral.
