# 👜 Wallet implementation

Now that we are able to get Pyth price data easily, we need to be able to interact with a Decentralized Exchange and swap our tokens. To do so we will need to implement a wallet. We have two different paths to consider, a mock wallet and also using an existing, funded wallet (we'll refer to this as the "live" wallet going forward).

For this component, we will want to display the amount of SOL tokens as well as the amount of SPL tokens in our wallet. We'll also want to display the calculated total value ("worth") of those two amounts, based on the current market price. The final piece of the puzzle will be the percentage of change in the total worth of our combined assets which will be used to indicate how our liquidation bot is performing. A positive percentage indicates a profit overall, and a negative percentage indicates a loss.
Let's break down how to implement this in our project.

We're going to use both the [Orca](https://www.orca.so/) and [Jupiter](https://jup.ag) software development kit (SDK) here. Keep in mind that as of this writing, Jupiter does not support Solana's devnet. **Therefore using the `JupiterSwapClient` carries the potential risk of losing funds on mainnet-beta**.

We'll need to import some code libraries to make the task easier (click on the name of the import in the list below to visit its documentation):

- [`@solana/web3.js`](https://solana-labs.github.io/solana-web3.js/) is used to connect to Solana clusters and simplifies making RPC calls
- [`axios`](https://axios-http.com/docs/intro) is a promise-based HTTP client which we can use to make requests
- [`bs58`](https://openbase.com/js/bs58/documentation) is a library for computing base 58 encoding, which is commonly used by cryptocurrencies
- [`lodash`](https://lodash.com/docs/4.17.15) is a popular library which simplifies working with arrays, numbers, objects & strings
- [`swr`](https://swr.vercel.app/) provides us with the `useSWR` hook, a powerful tool to fetch and cache data
- [`@jup-ag/core`](https://docs.jup.ag/jupiter-core/using-jupiter-core#usage) the Jupiter SDK enables us to create our `JupiterSwapClient`
- [`@orca-so/sdk`](https://github.com/orca-so/typescript-sdk#orca-typescript-sdk) the Orca SDK enables us to create our `OrcaSwapClient`
  - The needed portions of the SDKs are imported in `components/protocols/pyth/lib/swap.ts` where we define the client classes

```typescript
// components/protocols/pyth/lib/wallet.tsx

import {Cluster, clusterApiUrl, Connection} from '@solana/web3.js';
import {Keypair} from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';
import _ from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import useSWR from 'swr';
import {SOLANA_NETWORKS} from 'types';
import {JupiterSwapClient, OrcaSwapClient, SwapResult} from './swap';
```

Next we define some important interfaces and constants. `WalletBalance` relates to our mock wallet implementation. An `Order` contains the necessary information to carry out a swap. We also need to specify the mint addresses of the tokens we want to swap. The reason we need the Orca token's address is because swap routing on devnet uses the Orca token as an intermediate exchange: SOL -> ORCA -> USDC. \
We're specifying the decimals as well, to ease our on the fly calculations 😅.

```typescript
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

Here we're making a custom hook: `useExtendedWallet`. Note that this hook combines the functionality for our mock wallet as well as using a **secret key** for an existing (and funded) keypair. You might expect to use a wallet adapter and hook into a browser extension wallet like Phantom here. The frequency of swapping we'll be performing requires that we have an alternate, faster method to sign transactions. Nobody wants to sit in front of a computer clicking all day, do they? 😉

Check out the function signature for `useExtendedWallet`:

```typescript
export const useExtendedWallet = (
  useMock = false,
  cluster: Cluster,
  price: number = 0,
) => {
```

We pass in a boolean value to decide if we want to use the mock wallet or not. It's important to specify which Solana cluster we want to target, devnet or mainnet-beta. Price will default to zero.

How `setKeypair` works here is to helps us to generate the keypair from the input secret key, otherwise to generate a random keypair for the mock wallet. It is a requirement of the Jupiter SDK that we provide a keypair to be able to fetch market data.

```typescript
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

You'll notice that `setBalance` is for setting the mock wallet balance based on our trades.

The `orderBook` is maintained in our app state.

By leveraging the `useSWR` hook here, we can make sure that the amounts being displayed for the balance of our tokens on the front-end is accurate. The values are cached for us, and even on a slow connection they'll update in a reasonable amount of time. Putting a call to `mutate` in a `useEffect` hook with a dependency of `cluster` here means that any time we switch between the mock wallet and the live wallet the balance will be handled by `useSWR`. Clean code, keeps the kids happy 👍

The `balanceFetcher` function is a straightforward axios POST request to the Solana cluster which passes `getBalance` for the keypair to return the SOL balance and `getTokenAccountsByOwner` for both the SPL tokens - USDC and ORCA.

```typescript
const balanceFetcher = (keyPair: Keypair, cluster: Cluster) => () =>
  axios({
    url: clusterApiUrl(cluster),
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    data: [
      {
        jsonrpc: '2.0',
        id: 0,
        method: 'getBalance', // https://docs.solana.com/developing/clients/jsonrpc-api#getbalance
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
            mint: ORCA_MINT_ADDRESS, // just because it a midway swap token in devnet.
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      },
    ],
  });
```

```typescript
export const useExtendedWallet = (
  useMock = false,
  cluster: Cluster,
  price: number = 0,
) => {
  const [secretKey, setSecretKey] = useState<string | undefined>(undefined);

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

  const [balance, setBalance] = useState<WalletBalance>({
    sol_balance: 10 * SOL_DECIMAL,
    usdc_balance: 1400 * USDC_DECIMAL,
    orca_balance: 0, // just because of the devnet deps.
  });

  const [orderBook, setOrderbook] = useState<Order[]>([]);

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

  // it works very well in Mainnet.
  /**
   * The SDK allows developers to access over 10 Dexes with more than 6bn in liquidity, allowing developers to find the best route with a simple API call.
   */
  const [jupiterSwapClient, setJupiterSwapClient] =
    useState<JupiterSwapClient | null>(null);

  /**
   *  since jup.ag not supporting devnet yet, we use orca.
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

  const resetWallet = (params = {sol_balance: 10, usdc_balance: 1400}) => {
    if (!useMock) {
      setSecretKey(undefined);
    } else {
      setBalance({
        sol_balance: params.sol_balance * SOL_DECIMAL,
        usdc_balance: params.usdc_balance * USDC_DECIMAL,
        orca_balance: 0,
      });
    }
  };

  return {
    balance,
    resetWallet,
    keyPair,
    setSecretKey,
    addOrder,
    orderBook,
  };
};

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
        method: 'getTokenAccountsByOwner', //https://docs.solana.com/developing/clients/jsonrpc-api#gettokenaccountsbyowner
        params: [
          keyPair?.publicKey.toBase58(),
          {
            mint:
              cluster === 'mainnet-beta'
                ? USDC_MINT_ADDRESS
                : 'EmXq3Ni9gfudTiyNKzzYvpnQqnJEMRw2ttnVXoJXjLo1', // orca devnet pool USDC equivelent token mint address.
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner', //https://docs.solana.com/developing/clients/jsonrpc-api#gettokenaccountsbyowner
        params: [
          keyPair?.publicKey.toBase58(),
          {
            mint: ORCA_MINT_ADDRESS, // just because it a midway swap token in devnet.
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      },
    ],
  });
```

-
- Calculate the dollar value of the SOL in our wallet by multiplying the balance by the current price reported by Pyth (remember, this is only an estimate and is subject to change as the market fluctuates)
- Add the SOL value to the total value of USDC stablecoins in our wallet
- Wire up the ability to sign and send transactions

```typescript
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
```
