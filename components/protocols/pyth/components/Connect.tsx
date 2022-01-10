import {
  Col,
  Space,
  Typography,
  Switch,
  message,
  Statistic,
  Card,
  Tooltip,
} from 'antd';
import {useGlobalState} from 'context';
import {SyncOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {PythConnection, getPythProgramKeyForCluster} from '@pythnetwork/client';
import {pythMarketExplorer} from '../lib/index';
import {
  DollarCircleFilled,
  AimOutlined,
  CalculatorFilled,
} from '@ant-design/icons';
import {PYTH_NETWORKS} from 'types/index';

const {Title} = Typography;

const connection = new Connection(clusterApiUrl(PYTH_NETWORKS.DEVNET));
const pythPublicKey = getPythProgramKeyForCluster(PYTH_NETWORKS.DEVNET);
const pythConnection = new PythConnection(connection, pythPublicKey);

const Connect = () => {
  const {state, dispatch} = useGlobalState();
  const [fetching, setFetching] = useState<boolean>(false);

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [exponent, setExponent] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (price) {
      dispatch({
        type: 'SetIsCompleted',
      });
    }
  }, [price, setPrice]);

  const getPythData = async (checked: boolean) => {
    pythConnection.onPriceChange((product, price) => {
      if (
        product.symbol === 'Crypto.SOL/USD' &&
        price.price &&
        price.confidence
      ) {
        console.log(
          `${product.symbol}: $${price.price} \xB1$${price.confidence}`,
        );
        console.log(price);
        console.log(product);
        setSymbol('Crypto.SOL/USD');
        setPrice(price.price);
        setConfidence(price.confidence);
        setExponent(price.exponent);
      } else if (product.symbol === 'Crypto.SOL/USD' && !price.price) {
        console.log(`${product.symbol}: price currently unavailable`);
        setSymbol('Crypto.SOL/USD');
        setPrice(0);
        setConfidence(0);
        setExponent(0);
      }
    });

    if (!checked) {
      message.info('Stopping Pyth price feed!');
      pythConnection.stop();
      setFetching(false);
    } else {
      message.info('Starting Pyth price feed!');
      pythConnection.start();
      setFetching(true);
    }
  };

  return (
    <Col>
      <Space direction="vertical" size="large">
        <Card
          size="small"
          title={
            <Title level={3}>
              <a
                href={pythMarketExplorer(
                  PYTH_NETWORKS.DEVNET,
                  symbol as string,
                )}
              >
                {symbol}
              </a>{' '}
            </Title>
          }
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
          {price && fetching && (
            <>
              <Confetti
                numberOfPieces={500}
                tweenDuration={1000}
                gravity={0.05}
                recycle={false}
              />
            </>
          )}{' '}
          <Tooltip title="Price" placement="right">
            <Statistic value={price} prefix={<DollarCircleFilled />} />
          </Tooltip>{' '}
          <Tooltip title="Confidence Interval" placement="right">
            <Statistic value={confidence} prefix={<AimOutlined />} />
          </Tooltip>{' '}
          <Tooltip title="Exponent" placement="right">
            <Statistic value={exponent} prefix={<CalculatorFilled />} />
          </Tooltip>{' '}
        </Card>
        <Space direction="horizontal" size="large"></Space>
      </Space>
    </Col>
  );
};

export default Connect;
