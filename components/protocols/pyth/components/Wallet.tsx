import {
  Col,
  Space,
  Switch,
  Statistic,
  Card,
  Button,
  Row,
  Input,
  notification,
  Tooltip,
} from 'antd';
import {useGlobalState} from 'context';
import {DollarCircleFilled, ArrowRightOutlined} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {EventEmitter} from 'events';
import {PYTH_NETWORKS, SOLANA_NETWORKS} from 'types/index';
import {
  SOL_DECIMAL,
  USDC_DECIMAL,
  useExtendedWallet,
} from '@figment-pyth/lib/wallet';
import _ from 'lodash';

const signalListener = new EventEmitter();

const Wallet = () => {
  const {state, dispatch} = useGlobalState();
  const [cluster, setCluster] = useState<Cluster>('devnet');

  const [useLive, setUseLive] = useState(false);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const {setSecretKey, keyPair, balance, addOrder, orderBook, resetWallet} =
    useExtendedWallet(useLive, cluster, price);

  const [orderSizeUSDC, setOrderSizeUSDC] = useState<number>(20); // USDC
  const [orderSizeSOL, setOrderSizeSOL] = useState<number>(0.14); // SOL

  // Shorten the public key for display purposes
  const displayAddress = `${keyPair.publicKey
    .toString()
    .slice(0, 6)}...${keyPair.publicKey.toString().slice(38, 44)}`;

  // State for tracking user worth with current Market Price.
  const [worth, setWorth] = useState({initial: 0, current: 0});

  useEffect(() => {
    const key = `open${Date.now()}`;
    if (cluster === SOLANA_NETWORKS.MAINNET) {
      notification.warn({
        message: 'WARNING!',
        description: 'Swaps on mainnet-beta use real funds ⚠️',
        key,
        duration: 5,
      });
    } else if (cluster === SOLANA_NETWORKS.DEVNET) {
      notification.info({
        message: 'On devnet ✅',
        description: 'Swaps on devnet have no actual value!',
        duration: 2,
      });
    }
  }, [cluster]);

  useEffect(() => {
    if (cluster == 'mainnet-beta') {
      dispatch({
        type: 'SetIsCompleted',
      });
    }

    // update the current worth each price update.
    const currentWorth = balance?.sol_balance * price! + balance.usdc_balance;
    setWorth({...worth, current: currentWorth});
  }, [price, orderSizeUSDC, setPrice]);

  useEffect(() => {
    signalListener.once('*', () => {
      resetWallet(); // Reset the wallet to the initial state. Destructured from useExtendedWallet.
    });

    return () => {
      signalListener.removeAllListeners();
    };
  }, []);

  return (
    <>
      <Col>
        <Space direction="vertical" size="large">
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

                <Col span={12}>
                  <Statistic
                    value={
                      price &&
                      (
                        (balance?.sol_balance / SOL_DECIMAL) * price! +
                        balance.usdc_balance / USDC_DECIMAL
                      ).toFixed(2)
                    }
                    prefix={'$'}
                    title={'TOTAL WORTH'}
                  />
                </Col>

                <Col span={12}>
                  <Statistic
                    value={
                      worth.initial
                        ? (worth.initial / worth.current) * 100 - 100
                        : '0'
                    }
                    prefix={'%'}
                    title={'Change'}
                  />
                </Col>
              </Row>
              <Row>
                {useLive ? (
                  <>
                    <Row>
                      <Input.Password
                        id="secretKey"
                        type="password"
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Paste your test wallet private key here"
                        style={{width: 450, verticalAlign: 'middle'}}
                        allowClear
                        addonBefore={
                          <>
                            Private Key <ArrowRightOutlined />
                          </>
                        }
                      />
                    </Row>
                  </>
                ) : null}
              </Row>
            </Card>
          </Space>
        </Space>
      </Col>
    </>
  );
};

export default Wallet;
