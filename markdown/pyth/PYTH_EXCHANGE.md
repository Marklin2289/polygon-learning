# 🧐 How to work with price data

In this step, we're going to work with some additional components to perform token swaps on a DEX. This is where we will swap our first SOL for some USDC so that we can begin using the liquidation bot.

On devnet, we'll use the Orca SDK to swap between SOL -> ORCA -> USDC.

On mainnet, we have access to the more powerful Jupiter SDK where we can swap directly without needing to keep track of intermediate pairs. Again, this mainnet enabled code is mainly for illustration and should not be used without understanding the inherent risks.

---

# 🧱 Building the Exchange component

We'll need to display the order book. Both the `OrcaSwapClient` and `JupiterSwapClient` will be used here to enable swapping SOL for SPL tokens.

# 🚚 Importing dependencies

We're goi

```typescript
import {Cluster, Connection, Keypair, PublicKey} from '@solana/web3.js';
import {Jupiter, RouteInfo, TOKEN_LIST_URL} from '@jup-ag/core';
import Decimal from 'decimal.js';
import {getOrca, Network, OrcaPoolConfig} from '@orca-so/sdk';
```

# 📈 Buy & Sell Orders

We need to define what an Order looks like so that we can work with it in code. This is a data type which contains information about an order, including the tokens being swapped and the size of the order.

```typescript
// Define the interface for an Order
interface Order {
  side: 'buy' | 'sell';
  size: number;
  price: number;
  fromToken: string;
  toToken: string;
}
```

We also want to keep track of the total worth of our assets based on market price, the React `useState` hook is an easy choice for this:

```typescript
// state for tracking user worth with current Market Price.
const [worth, setWorth] = useState({initial: 0, current: 0});
```

We will also set up some more app state to handle the details of the orders.

```typescript
// amount of Ema to buy/sell signal.
const [yieldExpectation, setYield] = useState<number>(0.001);
const [orderSize, setOrderSize] = useState<number>(20); // USDC
const [price, setPrice] = useState<number | undefined>(undefined);
const [symbol, setSymbol] = useState<string | undefined>(undefined);
const [orderBook, setOrderbook] = useState<Order[]>([]);
```

Take a look at how we can update the current worth:

```typescript
useEffect(() => {
  // Update the current worth each price update.
  const currentWorth = wallet?.sol_balance * price! + wallet.usdc_balance;
  setWorth({...worth, current: currentWorth});
}, [price, orderSizeUSDC, setPrice]);
```

# 📖 The order book

The order book is necessary to keep track of the buy and sell orders we're going to be generating. When the liquidation bot is running, orders will be happening frequently. Luckily for us, antd has a flexible component with built in pagination so we don't even need to program that part ourselves.

We've gone ahead and added a couple of buttons to the component being rendered on the right to let you send both buy and sell orders to the order book.

---

# 🏋️ Challenge #1

{% hint style="tip" %}
In `components/protocols/pyth/lib/swap.tsx`, implement X.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...

//...
```

**Need some help?** Check out these hints 👇

- ?

Still not sure how to do this? No problem! The solution is below so you don't get stuck.

---

# 😅 Solution

```typescript
// solution
//...
const buyHandler = signalListener.on('buy', (price: number) => {
  if (wallet.usdc_balance <= orderSize) return; // not enough balance
  setOrderbook((_orderBook) => [
    {
      side: 'buy',
      size: orderSize,
      price: price,
      fromToken: 'usdc',
      toToken: 'sol',
    },
    ..._orderBook,
  ]);
  const solChange = orderSize / price!;

  setWallet((_wallet) => ({
    sol_balance: _wallet.sol_balance + solChange,
    usdc_balance: _wallet.usdc_balance - orderSize,
  }));
});
//...
```

**What happened in the code above?**

- ?

---

# ✅ Make sure it works

Once you've made the necessary changes to `components/protocols/pyth/lib/swap.tsx` and saved the file, click on the "sell" and "buy" buttons to send an order of each type on devnet using Orca.

---

# 🏁 Conclusion

We created functions to exchange tokens on Solana using a private key and a DEX.
