---
description: Full list of accepted collateral with LTV ratios and contract addresses.
---

# Listed tokens

Every token listed below is accepted as collateral on Based Loans. All tokens use a 50% loan-to-value ratio. This means for every $1,000 of collateral value at the time your loan opens, you receive USDC equal to half that value. The loan amount and buyback cost are locked at that moment and do not change during the loan period.

{% hint style="warning" %}
Always verify contract addresses before interacting with any token. Use only the addresses listed on this page or confirmed directly from the project's official channels. Based Loans does not support unofficial or bridged versions of listed tokens.
{% endhint %}

***

## Accepted collateral

| Token | Name | Contract address | LTV |
|---|---|---|---|
| AAVE | Aave | [0x6370...14b](https://basescan.org/address/0x63706e401c06ac8513145b7687A14804d17f814b) | 50% |
| AERO | Aerodrome | [0x9401...631](https://basescan.org/address/0x940181a94A35A4569E4529A3CDfB74e38FD98631) | 50% |
| ALB | AlienBase | [0x1dd2...C4](https://basescan.org/address/0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4) | 50% |
| BOMI | BOMI | [0x46D8...fe0d](https://basescan.org/address/0x46D8f8Ba030c1D09ae17d2B5107dfef4B331fe0d) | 50% |
| BRETT | Brett | [0x532f...E4](https://basescan.org/address/0x532f27101965dd16442E59d40670FaF5eBB142E4) | 50% |
| cbBTC | Coinbase Wrapped BTC | [0xcbB7...3Bf](https://basescan.org/address/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf) | 50% |
| cbETH | Coinbase Wrapped Ether | [0x2Ae3...C22](https://basescan.org/address/0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22) | 50% |
| CHIP | CHIP | [0x0C1c...F6e](https://basescan.org/address/0x0C1c1C109FE34733fca54b82d7B46B75CFb71F6e) | 50% |
| DUB | DUB | [0x3045...856](https://basescan.org/address/0x30457a1ab7cd796d6E55E4e5BA12e09f2283e856) | 50% |
| ELON | Dogelon Mars | [0x4a9f...B32a](https://basescan.org/address/0x4a9f3ed92892c0168DC194eC3867f8316288B32a) | 50% |
| ESHARE | ESHARE | [0xb7C1...871](https://basescan.org/address/0xb7C10146bA1b618956a38605AB6496523d450871) | 50% |
| GDEX | GDEX | [0x53Cb...44d](https://basescan.org/address/0x53Cb59D32a8d08fC6D3f81454f150946A028A44d) | 50% |
| HYDX | HydrexFi | [0x0000...6B30](https://basescan.org/address/0x00000e7efa313F4E11Bfff432471eD9423AC6B30) | 50% |
| LINK | Chainlink | [0x88Fb...196](https://basescan.org/address/0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196) | 50% |
| MONSTRO | Monstro DeFi | [0x1d3b...8f7](https://basescan.org/address/0x1d3bE1CC80cA89DDbabe5b5C254AF63200e708f7) | 50% |
| NOCK | NOCK | [0x9B5E...722](https://basescan.org/address/0x9B5E262cF9bb04869ab40b19AF91D2dc85761722) | 50% |
| OPG | OPG | [0xFbC2...5eB](https://basescan.org/address/0xFbC2051AE2265686a469421b2C5A2D5462FbF5eB) | 50% |
| PLAZM | PLAZM | [0xA1FB...8f6](https://basescan.org/address/0xA1FBB38bF486b97108aA87E92008187CA06998f6) | 50% |
| PLAY | PLAY | [0x853a...841](https://basescan.org/address/0x853a7c99227499DbA9dB8C3A02aA691aFDeBf841) | 50% |
| SIGN | Sign | [0x868F...A4c3](https://basescan.org/address/0x868FCEd65edBF0056c4163515dD840e9f287A4c3) | 50% |
| TRASH | TRASH | [0x6Be0...e92](https://basescan.org/address/0x6Be0745b111839D58609B09818cac71e47023e92) | 50% |
| TREB | Treble | [0xDd2f...80c](https://basescan.org/address/0xDd2fc771dDAB2b787AEDFd100a67d8a4754A380c) | 50% |
| VIRTUAL | Virtual Protocol | [0x0b3e...E1b](https://basescan.org/address/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b) | 50% |
| VVV | VVV | [0xacfE...1bf](https://basescan.org/address/0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf) | 50% |
| WETH | Wrapped Ether | [0x4200...0006](https://basescan.org/address/0x4200000000000000000000000000000000000006) | 50% |

***

## Understanding 50% LTV

LTV stands for loan-to-value. A 50% LTV means you receive USDC equal to half the current market value of your collateral at the time the loan opens.

**Example:** You deposit 1,000 BRETT tokens. At loan open, BRETT is priced at $0.20. Your collateral is worth $200. Your loan amount is $100 USDC.

The price used for this calculation is locked at loan open and does not change during the loan. This means your buyback cost is fully known from the start. There are no price updates, no margin calls, and no mid-loan adjustments.

The 50% ratio also creates the buffer that makes this model work for lenders. Even if a token's price falls significantly between loan open and expiry, lenders who receive the collateral at default still have meaningful room to recover more than they lent.
