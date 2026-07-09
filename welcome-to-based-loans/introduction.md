---
description: What Based Loans is, who it's for, and why it's different.
---

# Introduction

Based Loans is a lending protocol built on Base that lets token holders borrow USDC without selling, and lets USDC holders earn yield without the complexity of managing a lending book. It is built on the pawn shop model: fixed terms, fixed costs, and no liquidations. You know exactly what you are getting into before you open a loan.

***

## The problem with traditional DeFi lending

Most DeFi lending protocols work through a system of collateral ratios and price-triggered liquidations. You deposit tokens, borrow against them, and then watch. If the price of your collateral falls below a certain threshold, the protocol automatically sells your tokens, charges a penalty, and closes your position.

This model has a few serious problems.

* The liquidation price is not fixed. It shifts as the market moves, and health factor calculations can be hard to follow in real time.
* A sudden wick down, even one that reverses within minutes, can trigger liquidation before you have any chance to respond.
* Liquidation bots charge penalties on top of whatever interest you already owe.
* Lenders are exposed to the risk that the liquidation engine fails during a market crash, returning less than expected.

The result is a system that punishes borrowers for volatility they cannot control, and gives lenders a false sense of security that depends on infrastructure working perfectly under the worst possible conditions.

***

## The pawn shop solution

Pawn shops are one of the oldest lending institutions in the world, and they are simple for a reason. You bring an item of value, the broker gives you cash, you have a set period to buy it back, and if you do not return in time, the broker keeps the item. No renegotiation. No margin calls. No surprises.

Based Loans applies this model to crypto tokens. Your collateral is deposited when the loan opens. The value of that collateral is assessed once, at that moment, using multiple independent price sources. From that point, the price of your token is irrelevant to the loan terms. The buyback cost is set and does not change. You decide, on your own schedule, whether to buy back before the loan expires.

This removes the single biggest source of stress in DeFi lending: the position that can be liquidated while you sleep.

***

## How it works for borrowers

Borrowers deposit a supported token as collateral and receive 50% of its value in USDC. They choose a loan term of 15, 30, or 45 days, and the corresponding fee is fixed at that moment.

To reclaim your collateral, you pay back the original USDC amount plus the fee. You can do this in full or in portions at any time before the loan expires. Partial buybacks let you reclaim any percentage of your collateral by paying the proportional share of the fee.

If the loan expires without a buyback, the collateral transfers to the lenders who funded it. You keep the USDC you received at open.

There are no liquidations during the loan. No matter what the market does, your collateral sits untouched until you act or the term ends.

**→** [Borrowing](../borrowing/README.md)

***

## How it works for lenders

Lenders deposit USDC and configure which tokens they are willing to back. When a borrower opens a loan using a token the lender has enabled, the lender's USDC is matched to that loan. The borrower's fee is earned by the lender when the loan resolves.

If the borrower buys back: the lender receives their USDC back plus their share of the fee.

If the borrower does not buy back: the lender receives the collateral tokens instead. Because every loan is made at 50% LTV, those tokens were worth roughly twice the loan value at open, giving lenders a meaningful buffer before any price decline becomes a net loss.

Lenders never manage individual positions, monitor prices, or interact with liquidation mechanisms. They set their parameters once and let the protocol handle matching and settlement.

**→** [Lending](../lending/README.md)

***

## Built on Base by Monstro Labs

Based Loans is a product of Monstro Labs, a DeFi development team operating on Base. The protocol is governed at the contract level by Monstro DAO, a 5-of-7 multisig that controls protocol parameters, asset listings, and fee settings. No individual controls the protocol.

The smart contracts have been audited by Hashlock. Contract addresses, ownership structure, and audit reports are published in the Technology section of these docs.

***

## Get started

If you want to borrow USDC against your tokens, start with the [Borrowing](../borrowing/README.md) section.

If you want to earn yield on your USDC, start with the [Lending](../lending/README.md) section.

If you want to understand the mechanics in depth, start with [How it works](../how-it-works/README.md).
