Now that we are able to get Pyth price data, we need to take a detour away from Pyth for a moment to get our wallet interface figured out. The liquidation bot is going to need some tokens to trade on our behalf! We want to be able to leverage that data and interact with a Decentralized Exchange to swap tokens. We're going to implement a display of our wallet balances on the front-end, so that we can keep an eye on the changes as the liquidation bot is performing the swaps. We have two different displays to consider, the **mock wallet** to be used for learning and testing purposes and also a **live wallet** - pulling data from an existing, funded wallet that can be used on either devnet or mainnet.

_Remember the safety information about the risks of using real SOL from the introduction_!

# 🎠 Playground time

There's a comprehensive explanation of the code we are using in the `Wallet.tsx` component below. For now, just play around with the actual component on the right side of the screen. It's a good opportunity to familiarize yourself with the display. There are default balance values, and you can switch between the **mock wallet** and the **live wallet**. We assume that **you _will not_ want to use an account containing real SOL on mainnet** with an incomplete project - there are no safeguards in this code. Don't be alarmed, we just want to be crystal clear on that point! It's quite easy to tell the difference between the mock and live wallet displays. Only the mock wallet can be reset. _This is only truly relevant for testing_ - there is no way to reset balances of an on-chain account (immutable public ledgers and all 😉).

Once you click the toggle over to the **live wallet**, you'll notice some changes:

- The live wallet has a textinput for your private key.
- The shortened version of either your public key or a randomly generated pubkey is displayed - mouse-over it for a tooltip showing the entire public key.
- A textinput is included for you to enter a private key which will then display the associated public key & any SOL or USDC tokens of that keypair.
- The balance of ORCA tokens is also displayed, which is only relevant to swaps on devnet.

We default to using devnet, and you should also notice that the balance values change to zero when switching to the **live wallet**. This is because the balance of the randomly generated public key is, understandably, zero.

# 🔐 Getting your private key

Private keys are part of your keypair, such as the one created by the Solana CLI and stored in JSON format as a UInt8Array, or the one you created in Phantom. The [base58 encoded](https://medium.com/nakamo-to/what-is-base58-c6c2db7808f3) string of the private key is the preferred form for copy/paste operations as it's . We'll go over how to perform the encoding and decoding a little further ahead. For now, just be aware that the private key can be represented in either form.

When you're ready to test the **live wallet** on _devnet_ with a funded account, here are the steps to follow in the Phantom wallet to get your base58 encoded private key:

![Phantom Private Key Workflow](phantom_secret_key.png)

1. Click the hamburger menu at the top left
2. With the hamburger menu up, click on "Add / Connect Wallet"
3. Then click the option to "Create a new wallet"
4. View the newly created wallet's private key by clicking the gear icon on the bottom of the Phantom window
5. Scroll down inside Phantom and click on "Export Private Key"
6. You'll need to enter the password you've set up to unlock Phantom to reveal your private key
7. You'll now be able to copy and paste the private key into the wallet component on the right. Remember to keep your private keys private! 👻

{% hint style="tip" %}
You can switch Phantom to devnet by clicking the gear icon to open the settings, then scrolling down to "Change Network" where you can select the devnet cluster. This will allow you to confirm the balance change after you've airdropped some SOL.
{% endhint %}

![Phantom Settings](phantom_cluster.png)

If you're absolutely not comfortable with using the private key of an individual wallet that you control, we have also pre-funded a keypair on devnet with SOL and USDC for quick testing. Its public key is `9UpA4MYkBw5MGfDm5oCB6hskMt6LdUZ8fUtapG6NioLH` and it has the private key `4WoxErVFHZSaiTyDjUhqd6oWRL7gHZJd8ozvWWKZY9EZEtrqxCiD8CFvak7QRCYpuZHLU8FTGALB9y5yenx8rEq3`. Because this keypair is public, we cannot vouch for the balances remaining above 0, but we would ask that anybody using it does not simply drain it 🕵️.

# 🪂 Airdrop yourself some SOL

It's important to get some SOL on devnet to ensure that the balance is being displayed correctly, and also because we'll need to swap some SOL for USDC to be able to initiate the liquidation bot. There are several methods of airdropping SOL into a devnet account, and if you've completed the [Build a Solana Wallet course](https://learn.figment.io/pathways/solana-wallet) and the Solana 101 Pathway you should be familiar with this process.

Here's a quick method using a faucet website:

- Go to <https://solfaucet.com/> and paste the public key you just created in Phantom into the textinput
- You can request a maximum of 2 SOL per attempt, higher amounts will not work. This is due to limits on the airdrop function on devnet. Click on the blue "DEVNET" button to complete the airdrop.

You can confirm the balance change in Phantom as well as on the Wallet component in the Pathway. We'll cover how to swap some SOL for USDC when it becomes relevant further ahead in the pathway. For now, we've got some building to do 👉

# 🧱 Building the Wallet component

This component is necessary because we want to display the amount of SOL tokens & the amount of SPL tokens in our wallet (the USDC stablecoin is the SPL token we're referring to here). We'll also want to display the total value ("worth") of the combined amounts, based on the current market price. The final piece of the puzzle will be the percentage of change in the total worth of our wallet which will be used to indicate how our liquidation bot is performing. A positive percentage indicates a profit overall, and a negative percentage indicates a loss.

There are two files to be aware of, one is the React component [`components/protocols/pyth/components/Wallet.tsx`](https://github.com/figment-networks/learn-web3-dapp/main/components/protocols/pyth/components/Wallet.tsx) and the other is a collection of helper code [`components/protocols/pyth/lib/wallet.tsx`](https://github.com/figment-networks/learn-web3-dapp/main/components/protocols/pyth/lib/wallet.tsx). The React component is responsible for displaying the wallet data, and uses the helper code to fetch and format the data. Let's go ahead and break down the helper code for easier understanding!

# 🚚 Importing dependencies

There are [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) at the top of the component file (`/components/Wallet.tsx`) for the code libraries we'll use to make the Wallet component itself. Click on the name of an import in the lists below to visit the documentation if you'd like to learn more, but _feel free to scroll ahead_ if you're comfortable with the imports.

- [`antd`](https://ant.design/components/overview/) and [`@ant-design/icons`](https://ant.design/components/icon/) provide easy to use components for us to rapidly prototype our UI
- [`@pythnetwork/client`](https://github.com/pyth-network/pyth-client-js#pythnetworkclient) helps us to bring in Pyth data 🚀
- [`lodash`](https://lodash.com/docs/4.17.15) is a popular library which simplifies working with arrays, numbers, objects & strings
- [`rxjs`](https://rxjs.dev/guide/overview) is great for working with asynchronous events

We'll also need to import some other useful tools in the helper file (`/lib/wallet.tsx`) to make our component more flexible:

- [`@solana/web3.js`](https://solana-labs.github.io/solana-web3.js/) is used to connect to Solana clusters and simplifies making RPC calls
- [`axios`](https://axios-http.com/docs/intro) is a promise-based HTTP client which we can use to make requests
- [`bs58`](https://openbase.com/js/bs58/documentation) is a library for computing base 58 encoding, which is commonly used by cryptocurrencies
- [`lodash`](https://lodash.com/docs/4.17.15) is a popular library which simplifies working with arrays, numbers, objects & strings
- [`swr`](https://swr.vercel.app/) provides us with the `useSWR` hook, a powerful tool to fetch and cache data

We're going to use both the [Orca](https://www.orca.so/) and [Jupiter](https://jup.ag) software development kit (SDK) in this project. Keep in mind that as of this writing, Jupiter does not support Solana's devnet. Orca currently does support devnet, although there is a discrepancy between their prices and Pyth's. You'll see these imports in the file [`components/protocols/pyth/lib/swap.tsx`](https://github.com/figment-networks/learn-web3-dapp/main/components/protocols/pyth/lib/swap.tsx), which we will get to in the next step. For now, just be aware of them:

- [`@jup-ag/core`](https://docs.jup.ag/jupiter-core/using-jupiter-core#usage) the Jupiter SDK enables us to create our `JupiterSwapClient`
- [`@orca-so/sdk`](https://github.com/orca-so/typescript-sdk#orca-typescript-sdk) the Orca SDK enables us to create our `OrcaSwapClient`

# 💎 Interfaces and Constants

Next up, we need to define some important interfaces and constants:

- `WalletBalance` relates to our mock wallet implementation. This holds the balances we'll use in out **mock wallet**.
- An `Order` contains the necessary information to carry out a swap: If it is a buy or sell, the size of the swap, and the relevant tokens.
  - We also need to specify the mint addresses of the tokens we want to swap.
  - The reason we need the Orca token's address is because swap routing on devnet uses the Orca token as an intermediate exchange: SOL -> ORCA -> USDC.
- We're specifying the decimals, to ease our on the fly calculations 😅. Notice that we're `export`ing these so that they can be accessed by our Wallet component.

```typescript
// components/protocols/pyth/lib/wallet.tsx

interface WalletBalance {
  sol_balance: number;
  usdc_balance: number;
  orca_balance: number;
}

interface Order {
  side: 'buy' | 'sell';
  size: number;
  fromToken: string;
  toToken: string;
}

const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const USDC_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const ORCA_MINT_ADDRESS = 'orcarKHSqC5CDDsGbho8GKvwExejWHxTqGzXgcewB9L';

export const SOL_DECIMAL = 10 ** 9;
export const USDC_DECIMAL = 10 ** 6;
export const ORCA_DECIMAL = 10 ** 6;
```

# 🪝 The useExtendedWallet hook

We're making a custom hook to handle our wallet interactions which we will call `useExtendedWallet`. Note that this hook combines the functionality for our mock wallet as well as using a **secret key** for an existing (and funded) keypair. You might expect to use a wallet adapter to tap into a browser extension wallet like Phantom. The frequency of swapping we'll be performing requires that we have an alternate, faster method to sign transactions. Nobody wants to sit in front of a computer clicking all day, do they? 😉

We'll start with the function signature for `useExtendedWallet`. Notice that we're passing a boolean value to dtermine which wallet we'll use. We also need to specify which Solana cluster to target, devnet or mainnet-beta. Price will default to zero.

```typescript
// components/protocols/pyth/lib/wallet.tsx

export const useExtendedWallet = (
  useMock = false,
  cluster: Cluster,
  price: number = 0,
) => {
```

How `setKeyPair` works here is to help us generate the keypair from the input secret key, otherwise it will generate a random keypair for the mock wallet. The `useEffect` hook lets us determine what to do if there's a change in the value of `secretKey`, which would indicate a user has entered a value into the wallet component.

{% hint style="info" %}
It is a requirement of the Jupiter SDK that we provide a keypair to be able to fetch market data.
{% endhint %}

```typescript
// components/protocols/pyth/lib/wallet.tsx

const [keyPair, setKeyPair] = useState<Keypair>(Keypair.generate());
useEffect(() => {
  if (secretKey) {
    let arr = Uint8Array.from(bs58.decode(secretKey));
    const key = Keypair.fromSecretKey(arr);
    setKeyPair(key);
  } else {
    const temp = Keypair.generate(); // we use random keypair for mock to be able to get real market data.
    setKeyPair(temp);
  }
}, [secretKey]);
```

You'll notice that `setBalance` is for setting the **mock wallet** balance in the app state based on our trades. We also supply default values so that we can reset the mock wallet.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const [balance, setBalance] = useState<WalletBalance>({
  sol_balance: 10 * SOL_DECIMAL,
  usdc_balance: 1400 * USDC_DECIMAL,
  orca_balance: 0, // just because of the devnet deps.
});
```

The `orderBook` is maintained in our app state, and keeps track of the buy and sell orders within an array.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const [orderBook, setOrderbook] = useState<Order[]>([]);
```

The `balanceFetcher` function is a straightforward axios POST request to the Solana cluster which passes the `getBalance` method for the keypair to return the SOL balance and `getTokenAccountsByOwner` for both the SPL tokens - USDC and ORCA.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const balanceFetcher = (keyPair: Keypair, cluster: Cluster) => () =>
  axios({
    url: clusterApiUrl(cluster),
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    data: [
      {
        jsonrpc: '2.0',
        id: 0,
        method: 'getBalance', // SOL balance.
        params: [keyPair?.publicKey.toBase58()],
      },
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner', // https://docs.solana.com/developing/clients/jsonrpc-api#gettokenaccountsbyowner
        params: [
          keyPair?.publicKey.toBase58(),
          {
            mint:
              cluster === 'mainnet-beta'
                ? USDC_MINT_ADDRESS
                : 'EmXq3Ni9gfudTiyNKzzYvpnQqnJEMRw2ttnVXoJXjLo1', // Orca devnet pool USDC equivalent token mint address.
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner', // https://docs.solana.com/developing/clients/jsonrpc-api#gettokenaccountsbyowner
        params: [
          keyPair?.publicKey.toBase58(),
          {
            mint: ORCA_MINT_ADDRESS, // Required as a midway swap token for devnet swaps using Orca.
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      },
    ],
  });
```

By leveraging the `useSWR` hook here, we can make sure that the amounts being displayed for the balance of our tokens on the front-end is accurate. The values are cached for us, and even on a slow connection they'll update in a reasonable amount of time. We're also giving a refresh interval of five seconds.

Putting a call to `mutate` in a `useEffect` hook with a dependency of `cluster` means that any time we switch between the mock wallet and the live wallet the balance will be handled by `useSWR`. Clean and simple code, keeps the kids happy 👍

```typescript
// components/protocols/pyth/lib/wallet.tsx

const {data, mutate} = useSWR(
  () => `/balance/${keyPair?.publicKey}`, // cache key based on the keypair.
  balanceFetcher(keyPair!, cluster),
  {
    refreshInterval: 5000,
  },
);

useEffect(() => {
  mutate(); // refresh balance
}, [cluster]);
```

Our next `useEffect` hook is using lodash to simplify drilling down into the data object's properties to get our balances.

```typescript
// components/protocols/pyth/lib/wallet.tsx

useEffect(() => {
  if (data && !useMock) {
    /**
     * documentation link for _.get https://lodash.com/docs/4.17.15#get
     */
    const sol_balance = _.get(data, 'data[0].result.value', 0);
    const usdc_balance = _.get(
      data,
      'data[1].result.value[0]account.data.parsed.info.tokenAmount.amount',
      0,
    );
    const orca_balance = _.get(
      data,
      'data[2].result.value[0]account.data.parsed.info.tokenAmount.amount',
      0,
    );
    setBalance({sol_balance, usdc_balance, orca_balance});
  }
}, [data]);
```

Next we'll set up our app state for the `jupiterSwapClient` and `orcaSwapClient`, and then add another `useEffect` hook to initialize the clients whenever there is a change in the `keypair`.

```typescript
// components/protocols/pyth/lib/wallet.tsx

/**
 * The SDK allows developers to access over 10 Dexes with more than 6bn in liquidity, allowing developers to find the best route with a simple API call.
 */
const [jupiterSwapClient, setJupiterSwapClient] =
  useState<JupiterSwapClient | null>(null);

/**
 *  jup.ag does not support devnet yet, so we must use Orca.
 */
const [orcaSwapClient, setOrcaSwapClient] = useState<OrcaSwapClient | null>(
  null,
);

useEffect(() => {
  (async function _init(): Promise<void> {
    console.log('Keypair changed to: ', keyPair?.publicKey.toBase58());
    console.log('setting up clients');
    setJupiterSwapClient(null);
    setOrcaSwapClient(null);
    await getOrcaSwapClient();
    await getJupiterSwapClient();
    console.log('clients initialized');
  })();
}, [keyPair]);
```

Now we can define the swapClient getters. The main thing to notice here is that we're passing the RPC endpoint URL and parameters to a new `Connection` instance if there wasn't already an existing swap client in the app state.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const getOrcaSwapClient = async () => {
  if (orcaSwapClient) return orcaSwapClient;
  const _orcaSwapClient = new OrcaSwapClient(
    keyPair,
    new Connection(clusterApiUrl('devnet'), 'confirmed'),
  );
  setOrcaSwapClient((c) => _orcaSwapClient);
  return _orcaSwapClient;
};

const getJupiterSwapClient = async () => {
  if (jupiterSwapClient) return jupiterSwapClient;
  const _jupiterSwapClient = await JupiterSwapClient.initialize(
    new Connection('https://solana-api.projectserum.com/', 'confirmed'), // why not use clusterApiUrl('mainnet') over projectserum? because mainnet has rate limit at the moment.
    SOLANA_NETWORKS.MAINNET,
    keyPair,
    SOL_MINT_ADDRESS,
    USDC_MINT_ADDRESS,
  );
  setJupiterSwapClient((c) => _jupiterSwapClient);
  return _jupiterSwapClient;
};
```

When we're performing mock transactions, we want to be able to differentiate between adding an actual order and adding a mock order.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const addMockOrder = async (order: Order): Promise<SwapResult> => {
  const _jupiterSwapClient = await getJupiterSwapClient();

  // TokenA === SOL
  // TokenB === USDC
  const routes = await _jupiterSwapClient?.getRoutes({
    inputToken:
      order.side === 'buy'
        ? _jupiterSwapClient.tokenB
        : _jupiterSwapClient.tokenA,
    outputToken:
      order.side === 'buy'
        ? _jupiterSwapClient.tokenA
        : _jupiterSwapClient.tokenB,
    inputAmount: order.size,
    slippage: 1,
  });
  console.log('routes', routes);
  const bestRoute = routes?.routesInfos[0];
  console.log('bestRoute', bestRoute);
  const result = {
    inAmount: bestRoute?.inAmount || 0,
    outAmount: bestRoute?.outAmount || 0,
    txIds: ['mockTransaction_XXXXX'],
  };

  // fake the transaction change.
  setBalance((previousBalance) => ({
    ...previousBalance,
    usdc_balance:
      order.side === 'buy'
        ? previousBalance.usdc_balance - result.inAmount
        : previousBalance.usdc_balance + result.outAmount,
    sol_balance:
      order.side === 'buy'
        ? previousBalance.sol_balance + result.outAmount
        : previousBalance.sol_balance - result.inAmount,
  }));

  return result;
};
```

Most of what we're doing here is simply conditional, depending on if we are handling buy or sell orders & which Solana cluster we're targeting. When we add to the order book, we can then display the results. The dependency array of this `useCallback` contains `useMock`, `cluster` & `keypair`.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const addOrder = useCallback(
  async (order: Order) => {
    console.log('addOrder', useMock, order, cluster);
    let result: SwapResult;
    if (useMock) {
      result = await addMockOrder(order);
    } else if (!useMock) {
      if (cluster === 'devnet') {
        console.log('HERE', cluster, useMock);
        const _orcaClient = await getOrcaSwapClient();
        if (order.side === 'buy') {
          result = await _orcaClient?.buy(order.size)!;
          console.log('result', result);
        } else if (order.side === 'sell') {
          console.log(_orcaClient);
          result = await _orcaClient?.sell(order.size)!;
        } else {
          console.log('WTF');
        }
      } else if (cluster === 'mainnet-beta') {
        console.log(jupiterSwapClient?.keypair.publicKey.toString());
        const _jupiterSwapClient = await getJupiterSwapClient();
        console.log(_jupiterSwapClient?.keypair.publicKey.toString());
        if (order.side === 'buy') {
          result = await _jupiterSwapClient?.buy(order.size);
        } else if (order.side === 'sell') {
          result = await _jupiterSwapClient?.sell(order.size);
        }
      }
    }
    if (result!) {
      const extendedOrder = {...order, ...result};
      setOrderbook((_orderBook) => [extendedOrder, ..._orderBook]);
    }
  },
  [useMock, cluster, keyPair],
);
```

When we're resetting the mock wallet balance, we can calculate the floating point numbers to display on the fly using our predefined decimal constants. If we're resetting the balance of the live wallet, thanks to the `useSWR` hook we can just set the secret key to be `undefined`, which will trigger a refresh.

```typescript
// components/protocols/pyth/lib/wallet.tsx

const resetWallet = (params = {sol_balance: 10, usdc_balance: 1400}) => {
  if (useLive) {
    // setSecretKey(undefined);
  } else {
    setBalance({
      sol_balance: params.sol_balance * SOL_DECIMAL,
      usdc_balance: params.usdc_balance * USDC_DECIMAL,
      orca_balance: 0,
    });
  }
};
```

Finally, our wallet utility will just return the important values:

```typescript
// components/protocols/pyth/lib/wallet.tsx

return {
  balance,
  resetWallet,
  keyPair,
  setSecretKey,
  addOrder,
  orderBook,
};
```

- Calculate the dollar value of the SOL in our wallet by multiplying the balance by the current price reported by Pyth (remember, this is only an estimate and is subject to change as the market fluctuates)
- Add the SOL value to the total value of USDC stablecoins in our wallet
- Wire up the ability to sign and send transactions

```typescript
// solution
// components/protocols/pyth/components/Wallet.tsx

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
} from 'antd';
import {useGlobalState} from 'context';
import {SyncOutlined} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {PythConnection, getPythProgramKeyForCluster} from '@pythnetwork/client';
import {DollarCircleFilled} from '@ant-design/icons';
import {EventEmitter} from 'events';
import {PYTH_NETWORKS, SOLANA_NETWORKS} from 'types/index';
import {
  ORCA_DECIMAL,
  SOL_DECIMAL,
  USDC_DECIMAL,
  useExtendedWallet,
} from '@figment-pyth/lib/wallet';
import _ from 'lodash';
import * as Rx from 'rxjs';

const connection = new Connection(clusterApiUrl(PYTH_NETWORKS.DEVNET));
const pythPublicKey = getPythProgramKeyForCluster(PYTH_NETWORKS.DEVNET);
const pythConnection = new PythConnection(connection, pythPublicKey);

const signalListener = new EventEmitter();

const Wallet = () => {
  const {state, dispatch} = useGlobalState();
  const [cluster, setCluster] = useState<Cluster>('devnet');

  const [useLive, setUseLive] = useState(false);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const {setSecretKey, keyPair, balance, addOrder, orderBook, resetWallet} =
    useExtendedWallet(useLive, cluster, price);

  const [yieldExpectation, setYield] = useState<number>(0.001); // amount of ema to buy/sell signal
  const [orderSizeUSDC, setOrderSizeUSDC] = useState<number>(20); // USDC
  const [orderSizeSOL, setOrderSizeSOL] = useState<number>(0.14); // SOL
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

  // Shorten the public key for display purposes
  const displayAddress = `${keyPair.publicKey
    .toString()
    .slice(0, 6)}...${keyPair.publicKey.toString().slice(38, 44)}`;

  // State for tracking user worth with current Market Price.
  const [worth, setWorth] = useState({initial: 0, current: 0});

  useEffect(() => {
    if (cluster === SOLANA_NETWORKS.MAINNET) {
      notification.warn({
        message: '⚠️ WARNING! ⚠️',
        description:
          'Swaps on mainnet-beta use real funds. Use extreme caution!',
      });
    } else if (cluster === SOLANA_NETWORKS.DEVNET) {
      notification.info({
        message: 'On devnet ✅',
        description: 'Swaps on devnet have no actual value!',
      });
    }
  }, [cluster]);

  useEffect(() => {
    if (price) {
      dispatch({
        type: 'SetIsCompleted',
      });
      // Set ordersize Amount in Sol respect to USDC.
      setOrderSizeSOL(orderSizeUSDC / price!);
    }

    // update the current worth each price update.
    const currentWorth = balance?.sol_balance * price! + balance.usdc_balance;
    setWorth({...worth, current: currentWorth});
  }, [price, orderSizeUSDC, setPrice]);

  return (
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
                <Switch
                  checked={useLive}
                  onChange={(val) => setUseLive(val)}
                  checkedChildren={'Live'}
                  unCheckedChildren={'Mock'}
                />{' '}
                {useLive ? (
                  <Switch
                    checked={cluster === 'mainnet-beta'}
                    onChange={(val) =>
                      setCluster(val ? 'mainnet-beta' : 'devnet')
                    }
                    checkedChildren={'Mainnet'}
                    unCheckedChildren={'Devnet'}
                  />
                ) : (
                  <>
                    <Button onClick={() => resetWallet()} disabled={useLive}>
                      Reset Wallet
                    </Button>
                  </>
                )}
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
                  value={balance?.orca_balance / ORCA_DECIMAL}
                  title={'ORCA'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={
                    (balance?.sol_balance / SOL_DECIMAL) * price! +
                    balance.usdc_balance / USDC_DECIMAL
                  }
                  title={'TOTAL WORTH'}
                />
              </Col>

              <Col span={12}>
                <Statistic
                  value={(worth.initial / worth.current) * 100 - 100}
                  prefix={'%'}
                  title={'Change'}
                />
              </Col>
            </Row>
            <Row>
              {useLive ? (
                <>
                  <Row>
                    <label htmlFor="secretKey">Public Key:&nbsp;</label>
                    {keyPair?.publicKey && displayAddress}
                  </Row>
                  <Row>
                    <label htmlFor="secretKey">Wallet Key:&nbsp;</label>
                    <Input
                      id="secretKey"
                      type="password"
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Paste a Solana private key into this textbox"
                      style={{width: 320}}
                    />
                  </Row>
                </>
              ) : null}
            </Row>
          </Card>
        </Space>
      </Space>
    </Col>
  );
};

export default Wallet;
```

---

# 🏋️ Challenge

{% hint style="tip" %}
In `components/protocols/pyth/lib/wallet.tsx`, implement a `useEffect` to set the keypair in the app state based on the user input of the `secretKey` (this is what is pasted into the textinput on the **live wallet**). You must replace the instances of `undefined` with working code to accomplish this.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...
const [keyPair, setKeyPair] = useState<Keypair>(Keypair.generate());
useEffect(() => {
  if (secretKey) {
    let arr = undefined;
    const key = undefined;
    setKeyPair(key);
  } else {
    const temp = Keypair.generate(); // The mock uses a random keypair to be able to get real market data.
    setKeyPair(temp);
  }
}, [secretKey]);
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
const [keyPair, setKeyPair] = useState<Keypair>(Keypair.generate());
useEffect(() => {
  if (secretKey) {
    let arr = Uint8Array.from(bs58.decode(secretKey));
    const key = Keypair.fromSecretKey(arr);
    setKeyPair(key);
  } else {
    const temp = Keypair.generate(); // The mock uses a random keypair to be able to get real market data.
    setKeyPair(temp);
  }
}, [secretKey]);
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
