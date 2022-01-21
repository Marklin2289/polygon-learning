# 👀 Visualizing Pyth data

To better understand and derive value from the Pyth price information for a given product, we'll want to visualize the data in a meaningful format. A line chart is a good way to display an increase or decrease in a value, so we will look at how to effectively represent our price data using a pre-made component library called [recharts](https://recharts.org/).

Before we can implement a chart to display, we will need to understand the calculations that define our chart data.

# 📈 Moving Averages

Because what we are building is effectively a financial application, we want to display the moving average we'll be using to determine our buy or sell signals for the tokens we want to trade.

For the engineers and the truly devoted learners, there is a dry explanation of Exponential Moving Average (EMA) calculations available on [Wikipedia](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average) - but this is likely to be _very_ confusing to most readers. Luckily, there is a simple way to visualize this formula and what it will produce!

The EMA formula can be expressed as: `EMAc` = (`value` - `EMAp`) \* `weight` + `EMAp`

- `EMAc` is the currently calculated EMA - "c" stands for "current", because we are going to be using a timeframe smaller than a single day on our chart. This is the product of our calculation, but don't get too hung up on this.
- `value` is the current value, so in our case the price being reported by Pyth.
- `EMAp` is the previously calculated EMA - "p" stands for "previous".
- `weight` is a multiplier that gives less importance to older values. This can also be referred to as a "smoothing factor". To calculate the `weight` we require a timeframe, known as a **window** (this can be an arbitrary number: 10 days, 5 days, 45 minutes, etc.)

We need to define our **smoothing factor** or `weight`, which can be done by dividing 2 by the **window** + 1:

```text
           2
weight = -----
         w + 1
```

```typescript
// components/protocols/pyth/components/Chart.tsx

//
const ema = (newData.price - previousEma) * smoothingFactor + previousEma;
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

# 🌱 Bringing the Chart to life

```typescript
// components/protocols/pyth/components/Chsrt.tsx

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
        <Select.Option value={'1D'}>Day</Select.Option>
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
        {/* <Area dataKey="sma" stroke="#FF0000" fillOpacity={0} /> */}
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
