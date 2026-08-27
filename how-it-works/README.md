---
description: The pawn shop model applied to crypto. Simple, predictable, and fair.
icon: lightbulb
---

# How it works

Based Loans is built on one of the oldest lending models in the world: the pawn shop. You deposit collateral, receive USDC, and have the option to buy your collateral back before the loan expires. No margin calls, no liquidations, no surprises. Every term is fixed the moment you borrow.

***

## Explore the how it works pages

**●** [**The pawn shop model**](pawn-shop-model.md)\
Why this model creates certainty for borrowers and lenders, and how it maps to crypto.

**●** [**Loan lifecycle**](loan-lifecycle.md)\
Every stage of a loan from collateral deposit to expiry, with both possible outcomes covered.

**●** [**Collateral and pricing**](collateral-and-pricing.md)\
How collateral value is determined at loan open, how the multi-source oracle works, and why your loan amount is fixed.

**●** [**Fees and terms**](fees-and-terms.md)\
The fee table, how fees are calculated, what they pay for, and what is locked in the moment you borrow.

***

## What makes it work

#### ✔ No liquidations

Your collateral cannot be forcibly sold during the loan. Price volatility does not trigger any automatic action against you. The only two outcomes are: you buy back your collateral, or you walk away and the lender keeps it.

#### ✔ Fixed terms and fixed costs

The fee you owe is set at the moment the loan opens and never changes. You know exactly what it costs to get your collateral back before you ever sign the transaction.

#### ✔ Partial buybacks

You are not forced to buy back all of your collateral at once. You can reclaim any portion at any time before expiry, paying only the proportional share of the fee.

#### ✔ Lender-controlled risk

Lenders choose which tokens they will accept as collateral and set a USDC cap per token. This gives lenders direct control over the risk profile of their position without relying on protocol-wide governance.

#### ✔ Multi-source pricing

Collateral value is determined using multiple independent price sources: a time-weighted average price from a V3-compatible DEX pool, and where available a DIA feed. Requiring several independent sources to agree reduces the risk of any one being manipulated.

***

Based Loans removes the complexity that makes most DeFi lending stressful. Pick a term, deposit your collateral, receive USDC, and decide later whether to buy it back. That is the entire borrower experience.
