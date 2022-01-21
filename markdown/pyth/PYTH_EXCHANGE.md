# 🧐 How to work with price data

In this step, we're going to work with some additional components to display the price feed in a chart format to illustrate the confidence interval and also to perform buy/sell operations on an Automated Market Maker (AMM). The purpose of this is to generate a yield over time by taking advantage of the price movements.

We will use the [recharts](https://github.com/recharts/recharts#recharts) library to display our data as a chart, and we'll also be using the `OrcaSwapClient` and `JupiterSwapClient` we created before.

---

```typescript
import {Cluster, Connection, Keypair, PublicKey} from '@solana/web3.js';
import {Jupiter, RouteInfo, TOKEN_LIST_URL} from '@jup-ag/core';
import Decimal from 'decimal.js';
import {getOrca, Network, OrcaPoolConfig} from '@orca-so/sdk';
```

# 📈 Buy & Sell Orders

We need to define what an Order looks like so that we can work with it in code.

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

We will also set up some more state to handle the details of the orders.

```typescript
// amount of Ema to buy/sell signal.
const [yieldExpectation, setYield] = useState<number>(0.001);
const [orderSize, setOrderSize] = useState<number>(20); // USDC
const [price, setPrice] = useState<number | undefined>(undefined);
const [symbol, setSymbol] = useState<string | undefined>(undefined);
const [orderBook, setOrderbook] = useState<Order[]>([]);
```

Take a look at how we can update the total worth:

```typescript
useEffect(() => {
  if (price) {
    dispatch({
      type: 'SetIsCompleted',
    });
  }
  // update the current worth each price update.
  const currentWorth = wallet?.sol_balance * price! + wallet.usdc_balance;
  setWorth({...worth, current: currentWorth});
}, [price, setPrice]);
```

---

# 🏋️ Challenge #1

{% hint style="tip" %}
In `components/pyth/components/Exchange.tsx` complete the `buyHandler` function.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
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

# 🏋️ Challenge #2

{% hint style="tip" %}
In `components/pyth/components/Exchange.tsx` complete the `sellHandler` function.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
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

Once you've made the necessary changes to `components/pyth/components/Exchange.tsx` and saved the file, click on the toggle switch labeled "Price feed Off" on the right side of the screen to connect & start displaying the price chart as well as the wallet statistics.

---

# 🏁 Conclusion

We created a liquidation bot that exchanges crypto using a predefined wallet and an AMM.
