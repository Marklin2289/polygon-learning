# 👜 Wallet implementation

To be able to interact with the DEX and swap our tokens, we will need to implement the Serum wallet adapter. We've chosen to use the Sollet wallet, because it simplifies receiving SOL airdrops.

For this component, we will want to display the amount of SOL tokens as well as the amount of SPL token in our wallet. We'll also want to display the calculated total worth of those two amounts, based on the current market price - and the final piece of the puzzle will be the percentage of change in the total worth of our combined assets which will be used to indicate how our liquidation bot is performing. A positive percentage indicates a profit, and a negative percentage indicates a loss.

Let's break down how to implement this in our project:

- Initialize the Serum wallet adapter
- Calculate the dollar value of the SOL in our wallet by multiplying the balance by the current price reported by Pyth (remember, this is only an estimate and is subject to change as the market fluctuates)
- Add the SOL value to the total value of USDC stablecoins in our wallet
- Wire up the ability to sign and send transactions

```typescript
let _wallet: Wallet | null = null;
const useWallet = (): Wallet => {
  if (_wallet) return _wallet;
  _wallet = new Wallet('https://www.sollet.io', SOLANA_NETWORKS.DEVNET);
  return _wallet;
};

interface FakeWallet {
  sol_balance: number;
  usdc_balance: number;
}
```
