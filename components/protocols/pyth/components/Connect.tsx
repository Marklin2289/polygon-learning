import {Col, Space, Typography, Switch, message, Statistic, Card} from 'antd';
import {useGlobalState} from 'context';
import {SyncOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {PythConnection, getPythProgramKeyForCluster} from '@pythnetwork/client';
import {DollarCircleFilled} from '@ant-design/icons';

const {Text} = Typography;

const SOLANA_CLUSTER_NAME: Cluster = 'devnet';
const connection = new Connection(clusterApiUrl(SOLANA_CLUSTER_NAME));
const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME);
const pythConnection = new PythConnection(connection, pythPublicKey);

const Connect = () => {
  const {state, dispatch} = useGlobalState();

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (price) {
      dispatch({
        type: 'SetIsCompleted',
      });
    }
  }, [price, setPrice]);

  const getPythData = async (checked: boolean) => {
    pythConnection.onPriceChange((product, price) => {
      // sample output: SRM/USD: $8.68725 ±$0.0131
      if (
        product.symbol === 'Crypto.SOL/USD' &&
        price.price &&
        price.confidence
      ) {
        console.log(
          `${product.symbol}: $${price.price} \xB1$${price.confidence}`,
        );
        setPrice(price.price);
        setSymbol('Crypto.SOL/USD');
      } else if (product.symbol === 'Crypto.SOL/USD' && !price.price) {
        console.log(`${product.symbol}: price currently unavailable`);
        setPrice(0);
        setSymbol('Crypto.SOL/USD');
      }
    });

    if (!checked) {
      message.info('Stopping feed!');
      console.log('Stopping Pyth price feed...');
      pythConnection.stop();
    } else {
      message.info('Starting feed!');
      console.log('Starting Pyth price feed...');
      pythConnection.start();
    }
  };

  return (
    <Col>
      <Space direction="vertical" size="large">
        <Card
          size="small"
          title={symbol}
          style={{width: 400}}
          extra={
            <Switch
              checkedChildren={<SyncOutlined spin />}
              unCheckedChildren={'Price feed Off'}
              onChange={getPythData}
            />
          }
        >
          {' '}
          {price && (
            <Confetti
              numberOfPieces={500}
              tweenDuration={1000}
              gravity={0.05}
            />
          )}{' '}
          <Statistic value={price} prefix={<DollarCircleFilled />} />{' '}
        </Card>
        <Space direction="horizontal" size="large"></Space>
      </Space>
    </Col>
  );
};

export default Connect;
