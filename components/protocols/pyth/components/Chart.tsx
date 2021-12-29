import {Price} from '@raydium-io/raydium-sdk';
import {useEffect, useState} from 'react';
import {Area, AreaChart, Line, Tooltip, XAxis, YAxis} from 'recharts';

export const Chart: React.FC<{data: any}> = ({data}) => {
  const [domain, setDomain] = useState({dataMax: 0, dataMin: 0, price: 10});
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
      <XAxis dataKey="ts" />
      <YAxis domain={[domain.dataMin, domain.dataMax || 'auto']} />
      <Area dataKey="priceConfidenceRange" stroke="#8884d8" fill="#8884d8" />
      <Area dataKey="price" stroke="#000" fillOpacity={0} />
      <Area dataKey="sma" stroke="#FF0000" fillOpacity={0} />
      <Area dataKey="ema" stroke="#00FF00" fillOpacity={0} />
    </AreaChart>
  );
};
