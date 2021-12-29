import {Cluster, Connection, Keypair} from '@solana/web3.js';
import {BN, Provider} from '@project-serum/anchor';
import {getOrca, Network, OrcaPoolConfig, OrcaU64} from '@orca-so/sdk';
import Decimal from 'decimal.js';
import {TokenListProvider} from '@solana/spl-token-registry';
import {MARKETS} from '@project-serum/serum';
import {Swap} from '@project-serum/swap';

const _account = Keypair.fromSecretKey(
  new Uint8Array([
    175, 193, 241, 226, 223, 32, 155, 13, 1, 120, 157, 36, 15, 39, 141, 146,
    197, 180, 138, 112, 167, 209, 70, 94, 103, 202, 166, 62, 81, 18, 143, 49,
    125, 253, 127, 53, 71, 38, 254, 214, 30, 170, 71, 69, 80, 46, 52, 76, 101,
    246, 34, 16, 96, 4, 164, 39, 220, 88, 184, 201, 138, 180, 181, 238,
  ]),
);

const placeOrderViaSerumSwap = async (
  connection: Connection,
  account: Keypair = _account,
) => {
  const SOL_USDC = MARKETS[86]; // only valid for mainnet
  async function getSwapClient() {
    const provider = new Provider(
      connection,
      _account as any,
      Provider.defaultOptions(),
    );
    const tokenList = await new TokenListProvider().resolve();
    return new Swap(provider, tokenList as any);
  }
  const swapClient = await getSwapClient();
  //   const route = swapClient?.route(WRAPPED_SOL_MINT, USDC_MINT);
  //   console.log(route);
  //   swapClient?.swap({
  //     fromMint: WRAPPED_SOL_MINT,
  //     toMint: USDC_MINT,
  //     amount: toNative(0.1 * LAMPORTS_PER_SOL),
  //     minExchangeRate: {
  //       rate: new BN(193.2),
  //       fromDecimals: 6,
  //       strict: false,
  //       quoteDecimals: 6,
  //     },
  //     fromMarket: await Market.load(
  //       connection,
  //       SOL_USDC.address,
  //       undefined,
  //       SOL_USDC.programId,
  //     ),
  //   });
  //   console.log(route, SOL_USDC);
};

const placeOrderViaOrca = async (
  connection: Connection,
  cluster: Cluster,
  account: Keypair = _account,
) => {
  const orca = getOrca(
    connection,
    cluster === 'devnet' ? Network.DEVNET : Network.MAINNET,
  );
  try {
    const viaSOL_USDC = async (amount: number = 0.1) => {
      const orcaSolPool = orca.getPool(OrcaPoolConfig.SOL_USDC);
      const solToken = orcaSolPool.getTokenA();
      const solAmount = new Decimal(amount);
      const quote = await orcaSolPool.getQuote(solToken, solAmount);
      const orcaAmount = quote.getMinOutputAmount();

      console.log(
        `Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} USDC`,
      );

      const swapPayload = await orcaSolPool.swap(
        account,
        solToken,
        solAmount,
        orcaAmount,
      );
      const swapTxId = await swapPayload.execute();
      console.log('Swapped:', swapTxId, '\n');
    };

    const viaSOL_ORCA_USDC = async (amount: number) => {
      const orcaSolPool = orca.getPool(OrcaPoolConfig.ORCA_SOL);
      const solToken = orcaSolPool.getTokenB();
      const solAmount = new Decimal(amount);
      const quote = await orcaSolPool.getQuote(solToken, solAmount);
      const orcaAmount = quote.getMinOutputAmount();

      console.log(
        `Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} ORCA`,
      );
      const swapPayload = await orcaSolPool.swap(
        account,
        solToken,
        solAmount,
        orcaAmount,
      );
      const swapTxId = await swapPayload.execute();
      console.log('Swapped:', swapTxId, '\n');

      const orcaUSDCPool = orca.getPool(OrcaPoolConfig.ORCA_USDC);
      const orcaToken = orcaUSDCPool.getTokenA();
      const quote2 = await orcaUSDCPool.getQuote(orcaToken, orcaAmount);
      const usdcAmount = quote2.getMinOutputAmount();

      console.log(
        `Swap ${orcaAmount.toNumber()} ORCA for at least ${usdcAmount.toNumber()} USDC`,
      );

      const swap2Payload = await orcaUSDCPool.swap(
        account,
        orcaToken,
        orcaAmount,
        usdcAmount,
      );

      const swapTxId2 = await swap2Payload.execute();
      console.log('Swapped:', swapTxId2, '\n');
    };

    await viaSOL_ORCA_USDC(0.1);

    // const market = await Market.load(
    //   connection,
    //   SOL_USDC.address,
    //   {},
    //   SOL_USDC.programId,
    // );
    // console.log(market);
    // const bids = await market.loadBids(connection);
    // const asks = await market.loadAsks(connection);
    // for (let [price, size] of bids!.getL2(20)) {
    //   console.log(price, size);
    // }

    // for (let order of asks.items) {
    //   console.log(
    //     order.orderId,
    //     order.price,
    //     order.size,
    //     order.side, // 'buy' or 'sell'
    //   );
    // }
    // console.log(orders);
    // const a = await market?.placeOrder(connection, {
    //   owner: wallet.publicKey as any,
    //   payer: wallet.publicKey as any,
    //   price: price as any,
    //   side: 'buy',
    //   size: 1,
    // });
    // console.log(a);
  } catch (e) {
    console.log(e);
  }
};

const DECIMALS = 6;
function toNative(amount: number) {
  return new BN(amount * 10 ** DECIMALS);
}

function fromNative(amount: BN) {
  return amount.toNumber() / 10 ** DECIMALS;
}
