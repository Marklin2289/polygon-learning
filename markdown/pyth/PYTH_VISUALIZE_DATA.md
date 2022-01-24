To better understand and derive value from the Pyth price information for a given product, we'll want to visualize the data in a meaningful format. A line chart is a basic way to display an increase or decrease in a value over time, so we will look at how to effectively represent our price data using a pre-made component library called [recharts](https://recharts.org/).

This helps to illustrate the price data coming from Pyth and also sets the stage for us to be able to to perform buy/sell operations using a Decentralized Exchange. We'll be calculating our buy and sell signals based on the Exponential Moving Average (EMA) which is a naive and un-opinionated method of achieving a yield. There are more complex ways of deciding when and how much to trade, which are all well beyond the scope of this pathway. Using the EMA, as long as the price trends upwards for the amount of time you are trading, you would expect to see a positive yield since you're just buying low and selling as the price rises.

We need to calculate the Simple Moving Average (SMA) as well, to kickstart the EMA with a point of reference. This is why you will not see the green line representing the EMA on the chart right away when starting it up the first time.

Slightly separate topics, though worth considering if you wish to build upon the basics of this Pathway: What is a novel and interesting way to calculate when to buy and when to sell? Are there ways in which you might safeguard against a particularly wide confidence interval, or even a sudden shock to the market?

---

# 👀 Charting Pyth data

The component being rendered on the right is defined in `components/protocols/pyth/components/ChartMock.tsx`, which contains both the price feed component from the Connect step and the Chart component defined in `components/protocols/pyth/components/Chart.tsx`.

```jsx
// components/protocols/pyth/components/ChartMock.tsx
// ...
<Card>
  <Chart data={data} />
</Card>
// ...
```

---

# 🧱 Building the Chart component

We will use the [recharts](https://github.com/recharts/recharts#recharts) library to display Pyth price data as an animated chart. There is a concise [getting Started](https://recharts.org/en-US/guide/getting-started) guide on the recharts website which should bring you up to speed for reading the contents of `components/protocols/pyth/components/Chart.tsx`.

---

# 📈 Moving Averages

Because what we are building is effectively a financial application, we want to display the moving average we'll be using to determine our buy & sell signals for the tokens we want to trade.

For the hard-boiled engineers and the truly devoted learners, there is a dry explanation of Exponential Moving Average (EMA) calculations available on [Wikipedia](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average) - but this is likely to be _very_ confusing to most readers. Luckily, there is a much simpler way to visualize this formula and what it will produce!

The EMA formula can be expressed as:

![EMA Formula](ema_formula.png)

```typescript
// solution
// * text example for accessibility *
// components/protocols/pyth/components/Chart.tsx

// Formula: EMAc = (value - EMAp) * weight + EMAp
const ema = (newData.price - previousEma) * smoothingFactor + previousEma;
```

- `EMAc` is the currently calculated EMA - "c" stands for "current", because we are going to be using a timeframe smaller than a single day on our chart. This is the product of our calculation, but don't get too hung up on this.
- `value` is the current value, so in our case the price being reported by Pyth.
- `EMAp` is the previously calculated EMA - "p" stands for "previous".
- `weight` is a multiplier that gives less importance to older values. This can also be referred to as a "smoothing factor". To calculate the `weight` we require a timeframe, known as a **window** (this can be an arbitrary number: 10 days, 5 days, 45 minutes, etc.)

We need to define our **smoothing factor** or `weight`, which can be done by dividing 2 by the **window** + 1:

```text
// solution

// * text example for accessibility *

           2
weight = -----
         w + 1
```

![Weight Formula](weight_calculation.png)

![EMA Chart](ema_chart.png)

We can add a `setData` hook to the `getPythData` function that we created in our initial Connect component, so that the `data` is being calculated on the spot, then passed into the Chart component. `newData` is defining the data structure in place, and populating the object with the price, confidence and a timestamp. We're using this `data` in the Chart component. You'll notice that we leave the SMA, EMA and trend as `undefined`. They're being calculated and set inside `setData` 😀

```typescript
// solution
// components/protocols/pyth/components/ChartMock.tsx

  const getPythData = async (checked: boolean) => {
    pythConnection.onPriceChange((product, price) => {
      // ...
        const newData: {
          price: number;
          priceConfidenceRange: number[];
          ts: number;
          sma: undefined | number;
          ema: undefined | number;
          trend: undefined | boolean;
        } = {
          price: price.price,
          priceConfidenceRange: [
            price?.price! - price?.confidence!,
            price?.price! + price?.confidence!,
          ],
          ts: +new Date(),
          sma: undefined,
          ema: undefined,
          trend: undefined,
        };

        /**
         * window & smoothingFactor are used to calculate the Exponential moving average.
         */
        const window = 10;
        const smoothingFactor = 2 / (window + 1);

        /**
         * Calculate Simple moving average:
         *   https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average
         * Calculate Exponential moving average:
         *   https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average
         * The Exponential moving average has a better reaction to price changes.
         *
         * Ref: https://blog.oliverjumpertz.dev/the-moving-average-simple-and-exponential-theory-math-and-implementation-in-javascript
         */
        setData((data) => {
          if (data.length > window) {
            const windowSlice = data.slice(data.length - window, data.length);
            const sum = windowSlice.reduce(
              (prev, curr) => prev + curr.price,
              0,
            );
            newData.sma = sum / window;

            const previousEma = newData.ema || newData.sma;
            const currentEma =
              (newData.price - previousEma) * smoothingFactor + previousEma;
            newData.ema = currentEma;

            /**
             * Trend of the price with respect to preview EMA.
             * If the price is higher than the EMA, it is a positive trend.
             * If the price is lower than the EMA, it is a negative trend.
             *
             * The signalListener emits an event carrying the buy or sell signal,
             * which we will manage with RxJS and use to populate the order book
             * used by the liquidation bot.
             */
            const trend = newData.ema / data[data.length - 1].ema;
            if (trend * 100 > 100 + yieldExpectation) {
              signalListener.emit('buy');
            } else if (trend * 100 < 100 - yieldExpectation) {
              signalListener.emit('sell');
            }
          }
          return [...data, newData];
        });
    // ...
};
```

- The returned `data` is what we are passing to the Chart component.

# 🌱 Bringing the Chart to life

Clicking on the price feed toggle switch will begin fetching price data from Pyth and passing it along to the Chart component. The green line indicating the EMA will not appear at first, because an exponential moving average requires a historical value to be calculated against. After a few seconds, the green line indicating the EMA will appear and begin tracking along the chart. You will notice that it does not precisely follow Pyth's reported price. In most cases, it will fall within the range of the confidence interval - however there can be cases where it appears to fall outside of the confidence interval. You can coroborate using the Simple moving average You can inspect the actual values at a given time by moving your mouse cursor over the chart.

![EMA Outside Confidence Interval](ema_outside_confidence.png)

The `CustomizedHistoricalHourAxisTick` is used to display the vertically oriented timestamps at the bottom of the chart. There are what we'll see for the short period of time we're running the chart here. `CustomizedHistoricalDayAxisTick` is used when displaying the larger time ranges. The chart has a dropdown menu to select the time range for displaying data - however we are not storing the chart data anywhere in this app and so the DAY and WEEK settings are mainly for illustrative purposes.

The Chart component is deceptively simple, most of it is setting up how the chart will look. Recharts has a declarative style, which makes it easy to follow the display logic and see where the values are being passed. We already calculated our SMA / EMA in the `ChartMock.tsx` component, and now they'll be displayed alongside the Pyth price data.

```typescript
// components/protocols/pyth/components/Chart.tsx

import {Select} from 'antd';
import {useEffect, useState} from 'react';
import {Area, AreaChart, Line, Tooltip, XAxis, YAxis} from 'recharts';

export const Chart: React.FC<{data: any}> = ({data}) => {
  const [domain, setDomain] = useState({dataMax: 0, dataMin: 0, price: 10});
  const [selectedTimeRange, setSelectedTimeRange] = useState('LIVE');
  useEffect(() => {
    if (data.length > 0) {
      const lastRange = data[data.length - 1].priceConfidenceRange;
      if (domain.dataMax < lastRange[1]) {
        setDomain({
          ...domain,
          dataMax: lastRange[1],
          dataMin: lastRange[0],
          price: data[data.length - 1].price,
        });
      }
    }
  }, [data]);
  return (
    <>
      <Select
        value={selectedTimeRange}
        defaultValue="LIVE"
        onChange={(value) => setSelectedTimeRange(value)}
      >
        <Select.Option value={'LIVE'}>LIVE</Select.Option>
        <Select.Option value={'1D'}>DAY</Select.Option>
        <Select.Option value={'1W'}>WEEK</Select.Option>
      </Select>
      <AreaChart
        width={730}
        height={250}
        data={data}
        stackOffset="none"
        syncMethod={'index'}
        layout="horizontal"
        barCategoryGap={'10%'}
        barGap={4}
        reverseStackOrder={false}
        margin={{top: 5, right: 30, left: 20, bottom: 5}}
      >
        <Tooltip />

        <YAxis
          stroke={'#222'}
          domain={[domain.dataMin, domain.dataMax || 'auto']}
          tickCount={4}
          scale="linear"
          // allowDataOverflow={true}
        />
        <XAxis
          stroke={'#222'}
          dataKey="ts"
          height={100}
          interval={'preserveStartEnd'}
          minTickGap={0}
          tickLine={false}
          tick={CustomizedHistoricalHourAxisTick}
        />

        <Area dataKey="priceConfidenceRange" stroke="#8884d8" fill="#8884d8" />
        <Area dataKey="price" stroke="#000" fillOpacity={0} />
        <Area dataKey="sma" stroke="#FF0000" fillOpacity={0} />
        <Area dataKey="ema" stroke="#00FF00" fillOpacity={0} />
      </AreaChart>
    </>
  );
};

const CustomizedHistoricalHourAxisTick = ({x, y, fill, payload}) =>
  payload.value ? (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill={fill}
        transform="rotate(-90) translate(0,-9.5)"
      >
        {new Date(payload.value).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </text>
    </g>
  ) : null;

const CustomizedHistoricalDayAxisTick = ({x, y, fill, payload}) =>
  payload.value ? (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill={fill}
        transform="rotate(-90) translate(0,-9.5)"
      >
        {new Date(payload.value).toLocaleDateString([], {
          day: 'numeric',
          month: 'numeric',
        })}
      </text>
    </g>
  ) : null;
```

---

# 🏋️ Challenge

{% hint style="tip" %}
In `components/protocols/pyth/lib/Chart.tsx`, implement X. You must replace the instances of `undefined` with working code to accomplish this.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...

//...
```

**Need some help?** Check out these links & hints 👇

-

Still not sure how to do this? No problem! The solution is below so you don't get stuck.

---

# 😅 Solution

```typescript
// solution
//...

//...
```

**What happened in the code above?**

-

---

# ✅ Make sure it works

?

---

# 🏁 Conclusion

?
