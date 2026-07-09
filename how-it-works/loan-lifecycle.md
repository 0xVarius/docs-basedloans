---
description: From deposit to expiry, every stage of a loan, step by step.
---

# Loan lifecycle

Every loan on Based Loans follows the same path. You deposit collateral, choose a term, receive USDC, and at some point before expiry you either buy back your collateral or you do not. This page walks through each stage of that lifecycle in detail, covering both outcomes.

***

## Stage 1: Opening a loan

**You choose your collateral token and loan term.**

To open a loan, you select a supported collateral token from your wallet, choose a loan term (15, 30, or 45 days), and approve the transaction.

At the moment the loan opens, the protocol does three things:

1. Reads the current price of your collateral token from the oracle (Pyth price feed + TWAP average, plus a DIA feed where available).
2. Calculates your loan amount as 50% of the collateral's value in USDC.
3. Calculates your buyback cost: the loan amount plus the fixed fee for your chosen term.

Both numbers are locked at this point. The loan amount you receive and the cost to buy back your collateral will not change for the life of the loan, regardless of what happens to the token price.

{% hint style="info" %}
The minimum loan amount is $50 USDC. If your collateral is not worth at least $100 at current prices, it will not qualify for a loan.
{% endhint %}

**Your USDC arrives.**

Once the loan is open, USDC is transferred to your wallet immediately. You can use it however you want: trade it, bridge it, hold it, spend it. The protocol does not track or restrict how you use the borrowed USDC.

***

## Stage 2: The active loan period

**Your collateral is held by the protocol.**

During the loan, your collateral token is held in the protocol's Core contract. The price of that token may rise or fall dramatically during this period. None of that affects your loan. Your buyback cost remains exactly what it was on day one.

**No monitoring required.**

There are no health factors, liquidation thresholds, or margin calls to watch. You do not need to top up collateral, watch price charts, or set alerts. The only deadline that matters is your loan expiry date.

**You can buy back at any time.**

The moment your loan is open, you can buy it back. There is no minimum hold period. If you open a 30-day loan and decide you want your collateral back two hours later, you can buy it back and pay the full 30-day fee. The fee does not scale down with time.

***

## Stage 3: Buyback (borrower reclaims collateral)

This is the first of two possible outcomes. You pay the buyback cost before the loan expires, and the protocol returns your collateral.

### Full buyback

You pay the full buyback cost: the original loan amount plus the full fee for your term. The protocol releases your entire collateral position back to your wallet in a single transaction.

### Partial buyback

You can reclaim any portion of your collateral before expiry. The minimum partial buyback payment is $1 USDC.

When you do a partial buyback, you specify how much USDC you are paying. The protocol calculates what fraction of your total collateral that payment covers, and releases that fraction back to your wallet. The remaining collateral stays in the loan under the same terms and expiry date.

**Example:** You opened a loan with 1,000 tokens as collateral. The full buyback cost is $200 USDC. You pay $100 USDC (half the cost). You receive 500 tokens back. The other 500 tokens remain in the loan, with the same expiry date, and will cost another $100 USDC to reclaim.

You can do as many partial buybacks as you like before expiry, paying off the loan piece by piece.

{% hint style="info" %}
Partial buybacks give you flexibility if you want to reclaim some collateral while keeping the rest of your USDC position active. You are not forced into an all-or-nothing decision.
{% endhint %}

***

## Stage 4: Expiry (borrower walks away)

This is the second possible outcome. The loan term ends and some or all of the collateral has not been bought back.

**What happens at expiry.**

When a loan expires, any collateral that has not been redeemed transfers to the lenders who funded the loan. This is how lenders earn yield: they receive the collateral token instead of getting their USDC back from that position.

The borrower keeps the USDC they received when the loan opened. They simply do not have their collateral anymore. This is the equivalent of deciding a pawned item is not worth redeeming.

**When walking away makes sense.**

If the value of the collateral token has fallen significantly below the buyback cost, walking away is the rational choice. The borrower received USDC at the start and already has it. Paying the buyback cost to reclaim collateral worth less than that cost would result in a net loss.

This is not a failure state. The protocol is designed to support this outcome. Borrowers are always choosing between "pay to get it back" and "keep the USDC." Both are valid.

{% hint style="warning" %}
Once a loan expires, the collateral cannot be recovered. Buybacks are only possible while the loan is active. Check your expiry date before the deadline if you intend to buy back.
{% endhint %}

***

## Full lifecycle at a glance

| Stage | What happens | Who acts |
|---|---|---|
| Loan opens | Collateral deposited, USDC sent to borrower, terms locked | Borrower |
| Active period | Collateral held, price changes have no effect, buyback available anytime | Borrower (optional) |
| Partial buyback | Borrower pays a portion of buyback cost, receives proportional collateral | Borrower |
| Full buyback | Borrower pays full buyback cost, receives all remaining collateral | Borrower |
| Expiry | Unredeemed collateral transfers to lenders | Protocol (automatic) |

***

## Summary

* Loans open by depositing collateral. The loan amount and buyback cost are fixed immediately.
* USDC arrives in your wallet right away. No waiting.
* The loan is active until the expiry date. Price movements do not affect your terms.
* You can buy back at any time, fully or partially, with a minimum partial payment of $1 USDC.
* If you do not buy back before expiry, lenders receive your remaining collateral. You keep the USDC.
* There are no liquidations, no margin calls, and no monitoring required during the active period.
