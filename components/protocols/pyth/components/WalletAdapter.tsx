import {
  Col,
  Space,
  Switch,
  message,
  Statistic,
  Card,
  Button,
  InputNumber,
  Table,
  Row,
} from 'antd';
import {useGlobalState} from 'context';
import {SyncOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import {clusterApiUrl, Connection} from '@solana/web3.js';
import {PythConnection, getPythProgramKeyForCluster} from '@pythnetwork/client';
import {DollarCircleFilled} from '@ant-design/icons';
import {Chart} from './Chart';
import Wallet from '@project-serum/sol-wallet-adapter';
import {EventEmitter} from 'events';
import {PYTH_NETWORKS, SOLANA_NETWORKS} from 'types/index';

const connection = new Connection(clusterApiUrl(PYTH_NETWORKS.DEVNET));
const pythPublicKey = getPythProgramKeyForCluster(PYTH_NETWORKS.DEVNET);
const pythConnection = new PythConnection(connection, pythPublicKey);

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

interface Order {
  side: 'buy' | 'sell';
  size: number;
  price: number;
  fromToken: string;
  toToken: string;
}

const signalListener = new EventEmitter();

const WalletAdapter = () => {
  const {state, dispatch} = useGlobalState();
  // const {wallet: _wallet, provider} = useProviderAndWallet();

  // Fake wallet for testing.
  const [wallet, setWallet] = useState<FakeWallet>({
    sol_balance: 100,
    usdc_balance: 10000,
  });

  // state for tracking user worth with current Market Price.
  const [worth, setWorth] = useState({initial: 0, current: 0});

  // Reset the wallet to the initial state.
  const resetWallet = (sol_amount = 10) => {
    if (!price) return;
    setWallet({
      sol_balance: sol_amount,
      usdc_balance: sol_amount * price,
    });
    const worth = sol_amount * price * 2;
    setWorth({initial: worth, current: worth});
  };
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    signalListener.once('*', () => {
      resetWallet();
    });

    return () => {
      signalListener.removeAllListeners();
    };
  }, [wallet]);

  const [data, setData] = useState<any[]>([]);
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
        setPrice(price.price);

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

            const trend = newData.ema / data[data.length - 1].ema;
            if (trend * 100 > 100 + yieldExpectation) {
              signalListener.emit('buy', newData.price);
            } else if (trend * 100 < 100 - yieldExpectation) {
              signalListener.emit('sell', newData.price);
            }
          }
          return [...data, newData];
        });
        setSymbol('Crypto.SOL/USD');
      } else if (product.symbol === 'Crypto.SOL/USD' && !price.price) {
        console.log(`${product.symbol}: price currently unavailable`);
        setPrice(0);
        setSymbol('Crypto.SOL/USD');
      }
    });

    if (!checked) {
      message.info('Stopping Pyth price feed!');
      pythConnection.stop();
    } else {
      message.info('Starting Pyth price feed!');
      pythConnection.start();
    }
  };
  return (
    <Col>
      <Space direction="vertical" size="large">
        <Space direction="horizontal">
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
            <Statistic value={price} prefix={<DollarCircleFilled />} />{' '}
          </Card>
        </Space>
        <Space direction="horizontal" size="large">
          <Card
            title="wallet"
            extra={<Button onClick={() => resetWallet()}>Reset Wallet</Button>}
          >
            <Row>
              <Col span={12}>
                <Statistic
                  value={wallet?.sol_balance}
                  precision={6}
                  title={'SOL'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={wallet?.usdc_balance}
                  precision={6}
                  title={'USDC'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={wallet?.sol_balance * price! + wallet.usdc_balance}
                  precision={6}
                  title={'TOTAL WORTH'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={(worth.initial / worth.current) * 100 - 100}
                  prefix={'%'}
                  precision={6}
                  title={'Change'}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      </Space>
    </Col>
  );
};

export default WalletAdapter;
