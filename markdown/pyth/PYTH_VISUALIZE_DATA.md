# 👀 Visualizing Pyth data

To better understand and derive value from the Pyth price information for a given product, we'll want to visualize the data in a meaningful format. A line chart is a good way to display a decrease or increase in a value, and so we will look at how to effectively represent our price data using a pre-made component library called [recharts](https://recharts.org/).

Before we can implement a chart to display, we will need to understand the calculations that define our chart data.

# 📈 Moving Averages

Because what we are building is effectively a financial application, we want to display the moving average to determine our buy or sell signals for the tokens we want to trade using our liquidation bot.

For the engineers and the truly devoted learners, there is a dry explanation of Exponential Moving Average calculations available on [Wikipedia](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average) - but this is likely to be _very_ confusing to most readers. Luckily, there is a simple way to visualize this formula and what it will accomplish!

The EMA formula can be expressed as: `EMAc` = (`value` - `EMAp`) \* `weight` + `EMAp`

- `EMAc` is the currently calculated EMA - "c" stands for "current", because we are going to be using a timeframe smaller than a single day on our chart. Don't get too hung up on this.
- `value` is the current value, so in our case the price being reported by Pyth.
- `EMAp` is the previously calculated EMA - "p" stands for "previous".
- `weight` is a multiplier that gives less importance to older values. This can also be referred to as a "smoothing factor". To calculate the `weight` we require a timeframe, known as a **window** (this can be an arbitrary number: 10 days, 5 days, 45 minutes, etc.)

We need to define our **smoothing factor** or `weight`, which can be done by dividing 2 by the **window** + 1:

```text
           2
weight = -----
         w + 1
```

We can add a `setData` hook to the `getPythData` function that we created in our initial Connect component, so that the data is being calculated on the spot and is then able to be fed into a Chart component:

```typescript
// solution
// components/protocols/pyth/components/Exchange.tsx
setData((data) => {
  if (data.length > window) {
    const windowSlice = data.slice(data.length - window, data.length);
    const sum = windowSlice.reduce((prev, curr) => prev + curr.price, 0);
    newData.sma = sum / window;

    const previousEma = newData.ema || newData.sma;
    const currentEma =
      (newData.price - previousEma) * smoothingFactor + previousEma;
    newData.ema = currentEma;

    const trend = newData.ema / data[data.length - 1].ema;
    if (trend * 100 > 100 + yieldExpectation) {
      signalListener.emit('buy', newData.price);
    } else if (trend * 100 < 100 - yieldExpectation) {
      signalListener.emit('sell', newData.price);
    }
  }
  return [...data, newData];
});
```

```typescript
// components/protocols/pyth/components/Chart.tsx
(newData.price - previousEma) * smoothingFactor + previousEma;
```

# 🌱 Bringing the Chart to life

# 🪢 Mixing price feeds

Using the [Rust client library](), it is possible to merge two existing products:

```rust
let btc_usd: Price = ...;
let eth_usd: Price = ...;
// -8 is the desired exponent for the result
let btc_eth: PriceConf = btc_usd.get_price_in_quote(&eth_usd, -8);
println!(BTC/ETH price: ({} +- {}) x 10^{}", price.price, price.conf, price.expo)
```
