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
  Input,
  Tag,
  notification,
  Tooltip,
  Alert,
} from 'antd';
import {useGlobalState} from 'context';
import {DollarCircleFilled, ArrowRightOutlined} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {PythConnection, getPythProgramKeyForCluster} from '@pythnetwork/client';
import {EventEmitter} from 'events';
import {PYTH_NETWORKS, SOLANA_NETWORKS} from 'types/index';
import {
  Order,
  SOL_DECIMAL,
  USDC_DECIMAL,
  ORCA_DECIMAL,
  useExtendedWallet,
} from '@figment-pyth/lib/wallet';
import * as Rx from 'rxjs';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import {DevnetPriceRatio} from './DevnetPriceRatio';

const connection = new Connection(
  clusterApiUrl(PYTH_NETWORKS.DEVNET),
  'singleGossip',
);
const pythPublicKey = getPythProgramKeyForCluster(PYTH_NETWORKS.DEVNET);
const pythConnection = new PythConnection(connection, pythPublicKey);

const signalListener = new EventEmitter();

const Exchange = () => {
  const {state, dispatch} = useGlobalState();
  const [cluster, setCluster] = useState<Cluster>('devnet');

  const [useLive, setUseLive] = useState(true);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const {
    setSecretKey,
    keyPair,
    balance,
    addOrder,
    orderBook,
    resetWallet,
    worth,
    devnetToMainnetPriceRatioRef,
  } = useExtendedWallet(useLive, cluster, price);

  // yieldExpectation is the amount of EMA to buy/sell signal
  const [yieldExpectation, setYield] = useState<number>(0.001);
  const [orderSizeUSDC, setOrderSizeUSDC] = useState<number>(20); // USDC
  const [orderSizeSOL, setOrderSizeSOL] = useState<number>(0.14); // SOL
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

  // Shorten the public key for display purposes
  const displayAddress = `${keyPair.publicKey
    .toString()
    .slice(0, 6)}...${keyPair.publicKey.toString().slice(38, 44)}`;

  useEffect(() => {
    const key = `open${Date.now()}`;
    if (cluster === SOLANA_NETWORKS.MAINNET) {
      notification.warn({
        message: 'MAINNET',
        description: 'Swaps on mainnet-beta use real funds ⚠️',
        key,
        duration: 5,
      });
    } else if (cluster === SOLANA_NETWORKS.DEVNET) {
      notification.info({
        message: 'DEVNET',
        description: 'Swaps on devnet do not use real funds ✅',
        duration: 2,
      });
    }
  }, [cluster]);

  // Reset the wallet to the initial state.

  useEffect(() => {
    if (orderBook.length > 0) {
      dispatch({
        type: 'SetIsCompleted',
      });
      // Set ordersize amount in SOL with respect to USDC.
      setOrderSizeSOL(orderSizeUSDC / price!);
    }
  }, [price, orderSizeUSDC, setPrice, orderBook]);

  useEffect(() => {
    signalListener.once('*', () => {
      resetWallet();
    });
    const buy = Rx.fromEvent(signalListener, 'buy').pipe(Rx.mapTo(1)); // for reduce sum function to understand the operation.
    const sell = Rx.fromEvent(signalListener, 'sell').pipe(Rx.mapTo(-1)); // for reduce sum function to understand the operation.
    Rx.merge(buy, sell)
      .pipe(
        Rx.tap((v: any) => console.log(v)),
        Rx.bufferTime(10000), // wait 10 second.
        Rx.map((orders: number[]) => {
          return orders.reduce((prev, curr) => prev + curr, 0); // sum of the orders in the buffer.
        }),
        Rx.filter((v) => v !== 0), // if we have equivalent signals, don't add any orders.
        Rx.map((val: number) => {
          if (val > 0) {
            // buy.
            return {
              side: 'buy',
              size: val * orderSizeUSDC,
              fromToken: 'usdc',
              toToken: 'sol',
            };
          } else if (val <= 0) {
            return {
              side: 'sell',
              size: Math.abs(val) * orderSizeSOL,
              fromToken: 'sol',
              toToken: 'usdc',
            };
          }
        }),
      )
      .subscribe(async (v: any) => {
        await addOrder({
          ...v,
          cluster,
        });
      });
    return () => {
      signalListener.removeAllListeners();
    };
  }, [
    yieldExpectation,
    orderSizeUSDC,
    orderSizeSOL,
    useLive,
    cluster,
    keyPair,
  ]);

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

            /**
             * Trend of the price with respect to preview ema.
             * If the price is higher than the ema, it is a positive trend.
             * If the price is lower than the ema, it is a negative trend.
             * prev 10 ema trend:
             * curr 11 ema  this would trend %110 up which is a BUY signal.
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
          <Card title={'Yield Expectation'} size={'small'}>
            <InputNumber
              value={yieldExpectation}
              onChange={(e) => setYield(e)}
              prefix="%"
            />
            <InputNumber
              value={orderSizeUSDC}
              onChange={(e) => setOrderSizeUSDC(e)}
              prefix="USDC"
            />
          </Card>
        </Space>
        <Space direction="horizontal" size="large">
          <Card
            style={{width: 550}}
            title={
              !useLive ? (
                'Mock Wallet'
              ) : (
                <Tooltip
                  title={keyPair.publicKey.toString()}
                  color={'purple'}
                  arrowPointAtCenter
                >
                  {displayAddress}
                </Tooltip>
              )
            }
            extra={
              <>
                {useLive ? (
                  <Switch
                    checked={cluster === 'mainnet-beta'}
                    onChange={(val) =>
                      setCluster(val ? 'mainnet-beta' : 'devnet')
                    }
                    checkedChildren={'mainnet-beta'}
                    unCheckedChildren={'devnet'}
                  />
                ) : (
                  <>
                    <Button
                      style={{verticalAlign: '-10%'}}
                      type="primary"
                      shape="round"
                      size="small"
                      icon={<DollarCircleFilled />}
                      onClick={() => resetWallet()}
                      disabled={useLive}
                    >
                      Reset Wallet
                    </Button>
                  </>
                )}{' '}
                <Switch
                  checked={useLive}
                  onChange={(val) => setUseLive(val)}
                  checkedChildren={'Live'}
                  unCheckedChildren={'Mock'}
                />
              </>
            }
          >
            <Row>
              <Col span={12}>
                <Statistic
                  value={balance?.sol_balance / SOL_DECIMAL}
                  title={'SOL'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={balance?.usdc_balance / USDC_DECIMAL}
                  title={'USDC'}
                />
              </Col>

              {useLive ? (
                <Col span={12}>
                  <Statistic
                    value={balance?.orca_balance / ORCA_DECIMAL}
                    title={'ORCA'}
                  />
                </Col>
              ) : null}

              <Col span={12}>
                <Statistic
                  value={worth.current.toFixed(4)}
                  prefix={'$'}
                  title={'TOTAL WORTH'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={worth.change.toFixed(4)}
                  prefix={'%'}
                  title={'Change'}
                />
              </Col>
            </Row>
            <Row>
              {useLive ? (
                <>
                  <Row>
                    <label htmlFor="secretKey" style={{paddingTop: 5}}>
                      Private Key <ArrowRightOutlined /> &nbsp;
                    </label>
                    <Input
                      id="secretKey"
                      type="password"
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Paste your test wallet Solana private key here"
                      style={{width: 330, verticalAlign: 'middle'}}
                    />
                  </Row>
                </>
              ) : null}
            </Row>
          </Card>
        </Space>
        {useLive && cluster === 'devnet' && (
          <DevnetPriceRatio
            devnetToMainnetPriceRatioRef={devnetToMainnetPriceRatioRef}
          />
        )}
        <Card>
          <BuySellControllers addOrder={addOrder} />
          <Statistic value={orderBook.length} title={'Number of Operations'} />
          <Table
            dataSource={orderBook}
            columns={[
              {
                title: 'Transactions',
                dataIndex: 'txIds',
                key: 'txIds',
                render: (txIds) => {
                  return (
                    <>
                      {txIds.map((txId: string) => (
                        <a
                          href={`https://solscan.io/tx/${txId}?cluster=${cluster}`}
                          key={txId}
                          target={'_blank'}
                          rel="noreferrer"
                        >
                          {txId?.substring(-1, 5)}
                        </a>
                      ))}
                    </>
                  );
                },
              },
              {
                title: 'Side',
                dataIndex: 'side',
                key: 'side',
              },
              {
                title: 'out Amount',
                dataIndex: 'inAmount',
                key: 'inAmount',
                render: (val, order) => {
                  if (order.side === 'buy') {
                    return <Tag color="red">{val / USDC_DECIMAL}</Tag>;
                  } else {
                    return <Tag color="green">{val / SOL_DECIMAL}</Tag>;
                  }
                },
              },
              {
                title: 'Out Token',
                dataIndex: 'fromToken',
                key: 'fromToken',
              },
              {
                title: 'in Amount',
                dataIndex: 'outAmount',
                key: 'outAmount',
                render: (val, order) => {
                  if (order.side === 'buy') {
                    return <Tag color="red">{val / SOL_DECIMAL}</Tag>;
                  } else {
                    return <Tag color="green">{val / USDC_DECIMAL}</Tag>;
                  }
                },
              },
              {
                title: 'In Token',
                dataIndex: 'toToken',
                key: 'toToken',
              },
            ]}
          ></Table>
        </Card>
      </Space>
    </Col>
  );
};

const BuySellControllers: React.FC<{addOrder: (order: Order) => void}> = ({
  addOrder,
}) => {
  const [buySize, setBuySize] = useState<number>(0.1);
  const [sellSize, setSellSize] = useState<number>(0.1);
  const [sellInitialSize, setSellInitialSize] = useState<number>(0.1);
  return (
    <Card bordered={false}>
      <Row>
        <Input.Group compact>
          <br />
          <InputNumber
            min={0}
            value={sellSize}
            onChange={(val) => setSellSize(val)}
          />
          <Button
            type="primary"
            onClick={async () =>
              await addOrder({
                side: 'sell',
                size: sellSize,
                fromToken: 'SOL',
                toToken: 'ORCA',
              })
            }
          >
            SOL -&gt; ORCA
          </Button>
        </Input.Group>
        <Col span={8}>
          <br />
          <Input.Group compact>
            <InputNumber
              min={0}
              value={sellSize}
              onChange={(val) => setSellSize(val)}
            />
            <Button
              type="primary"
              onClick={async () =>
                await addOrder({
                  side: 'sell',
                  size: sellSize,
                  fromToken: 'SOL',
                  toToken: 'USDC',
                })
              }
            >
              sell
            </Button>
          </Input.Group>
        </Col>
        <br />
        <br />
        <Col span={8}>
          <br />
          <Input.Group compact>
            <InputNumber
              min={0}
              value={buySize}
              onChange={(val) => setBuySize(val)}
            />
            <Button
              type="primary"
              onClick={async () =>
                await addOrder({
                  side: 'buy',
                  size: buySize,
                  fromToken: 'USDC',
                  toToken: 'SOL',
                })
              }
            >
              buy
            </Button>
          </Input.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default Exchange;
