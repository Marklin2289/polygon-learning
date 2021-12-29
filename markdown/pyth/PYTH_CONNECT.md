In this tutorial, we're going to interact with Pyth price data on the Solana blockchain using Pyth's own client library: `@pythnetwork/client` ([link](https://github.com/pyth-network/pyth-client-js)). It's a convenient way to interface with the on-chain price feed when building an application. We will explore it together as we add features to our app. By the end of this Pathway you will have built a working _liquidation bot_, which uses the aggregated price data supplied by Pyth.

Note that this pathway will not cover the basics, instead we will assume that you have completed both the Solana 101 pathway and the Solana Wallet tutorial. A working knowledge of TypeScript/JavaScript and React hooks is strongly recommended for this pathway.

---

# 🧐 What is Pyth, anyway?

Pyth is a protocol which allows publishers to include their price data for various asset pairs or _products_ on the Solana blockchain. There are three concerned parties interacting with the Pyth protocol:

1. _Publishers_ who submit their asset pricing data to Pyth.
2. _Pyth_ itself which is the on-chain program responsible for collecting and aggregating the price data and reporting it, including the **confidence interval**.
3. _Consumers_ who fetch the price information which is being produced by Pyth's on-chain program.

The Pyth on-chain program maintains several Solana accounts which are responsible for tracking the products and their current price data.
It is possible for consumers to interact with this data both on and off-chain, depending on their needs. \
Pyth uses three types of account on Solana:

1. _Product_ accounts store the metadata of a product such as its symbol and asset type.
2. _Price_ accounts store the current price information of a product, including the confidence interval.
3. _Mapping_ accounts maintain a linked list of other accounts - this allows applications to easily enumerate the full list of products served by Pyth.

Read more about [Pyth's account structure](https://docs.pyth.network/how-pyth-works/account-structure) on the official documentation.

---

# ⛓ Working with on-chain data

Pyth provides us with a few tools to consume the published data. For working with price feeds, there is the [JavaScript client](https://github.com/pyth-network/pyth-client-js) `pyth-client-js` which we installed during the setup for this project.

There is also a [Rust client](https://github.com/pyth-network/pyth-client-rs), which can be used in on-chain program development, and a [Neon EVM](https://github.com/pyth-network/pyth-neon) client that provides access to Pyth data through Solidity smart contracts. A Python client is coming soon, as well.

Finally, there is a client API for on-chain Pyth programs, [pyth-client](https://github.com/pyth-network/pyth-client).

# 🤑 Aggregate price

"Aggregate price" means a price that is the combination of several data points.

Read more about how Pyth [price aggregation](https://docs.pyth.network/how-pyth-works/price-aggregation) works on the official documentation.

---

# ⏰ Confidence interval

Pyth publishers supply a confidence interval because, in real markets, _there is no one single price for a product_ - it is constantly changing based on market activity over time.

A confidence **interval** is a range of values with an upper bound and a lower bound, computed at a particular confidence **level**.

Publishers who submit their price data to Pyth do not all use the same methods to determine their confidence in a given price. Because of the potential for a small number of publishers to influence the reported price of an asset, it is therefore important to use an _aggregated_ price. The **confidence interval** on Pyth represents the aggregated confidence interval being reported by Publishers. A price above or below the aggregated price interval of a product is an outlier. It is in the best interests of Publishers to provide high quality data, and a confidence interval which is too high or too low can lead to problems. Publishers do not always need to agree with eachother, there might be a good reason for a high confidence interval. Pyth calculates the price and confidence intervals for all products on a constant basis - Any Publisher behind by 25 slots is removed from the data pool until they can catch up, which prevents stale data from being served.

Read more about [best practices](https://docs.pyth.network/consumers/best-practices) for consuming price data from Pyth on the official documentation.

> If you are interested in seeing the breakdown of the aggregated data, it is available on the `priceComponents` property of the `price` object.

---

# 🧠 Exponents

Not all price accounts maintain their data in floating point format. It is necessary to use an exponent to convert price data from fixed-point to floating point. The readable price (including the decimal, i.e. 150.00473) is calculated by taking the `price` field from a Pyth price account and multiplying it by 10^`exponent`. This will be a negative exponent, which will move the decimal to the left.

---

# 🏋️ Challenge

{% hint style="tip" %}
In `components/pyth/components/Connect.tsx`, implement `getPythData` by creating an instance of the `PythConnection` class and then registering the `onPriceChange` callback. You must replace the instances of `undefined` with working code to accomplish this. We don't want you to be overwhelmed by price data for every available product, so we have narrowed it down to SOL/USD for the purposes of this tutorial.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...
const connection = new Connection(clusterApiUrl(PYTH_NETWORKS.DEVNET));
const pythPublicKey = undefined;
const pythConnection = undefined;

const Connect = () => {
  // ...
  const getPythData = async (checked: boolean) => {
    pythConnection.undefined => {
      if (
        product.symbol === 'Crypto.SOL/USD' &&
        price.price &&
        price.confidence
      ) {
        // ...
    });
    // ...
  };
//...
```

**Need some help?** Check out these hints 👇

- To connect to Pyth, use the `PythConnection` class from `@pythnetwork/client` - [Dive into the code](https://github.com/pyth-network/pyth-client-js/blob/3de72323598131d6d14a9dc9f48f5f225b5fbfd2/src/PythConnection.ts#L29) to see what it's doing. You'll need to supply a JSON-RPC connection and a Pyth program public key.
- There is a function for mapping Solana clusters to the public key of the Pyth program: `getPythProgramKeyForCluster`. \
  You'll need to supply the name of the Solana cluster you want to get Pyth data from (`mainnet-beta`, `devnet` or `testnet`).
- The onPriceChange callback will be invoked every time a Pyth price gets updated. This callback gets two arguments:
  - `price` contains the official Pyth price and confidence, along with the component prices that were combined to produce this result.
  - `product` contains metadata about the price feed, such as the symbol (e.g., "Crypto.SOL/USD") and the number of decimal points.
- Once you've set up the connection and the `onPriceChange` callback, you'll be able to tap into the price feed with a simple `pythConnection.start()`! \
  We have set up an easy to use component here to toggle it on and off, but in production you would probably want to handle this a little bit differently.

Still not sure how to do this? No problem! The solution is below so you don't get stuck.

---

# 😅 Solution

```typescript
// solution
//...
const connection = new Connection(clusterApiUrl(PYTH_NETWORKS.DEVNET));
const pythPublicKey = getPythProgramKeyForCluster(PYTH_NETWORKS.DEVNET);
const pythConnection = new PythConnection(connection, pythPublicKey);

const Connect = () => {
  // ...
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
};
//...
```

**What happened in the code above?**

- We created a `connection` instance of the `Connection` class using the `new` constructor.
- We then call `getVersion` on that `connection` instance. The docs state that `connection.getVersion` returns a Promise, so remember to use the `await` syntax.

---

# ✅ Make sure it works

Once you've made the necessary changes to `components/pyth/components/Connect.tsx` and saved the file, click on the toggle switch labeled "Price feed Off" on the right side of the screen to connect & display the current price of the SOL/USD product! Be aware that the queries are being put through a public endpoint and are therefore subject to rate and data limiting - If you leave this price feed running for a while, you will run out of requests and the feed will stop updating. Be sure to switch it off before moving to the next step!

---

# 🏁 Conclusion

We established a connection to the Pyth price feed on Solana using the JavaScript Pyth client and discussed the three main ideas behind the streaming of prices: Aggregate price, confidence interval and the exponent used to convert price data from fixed-point to floating point (which just means including the decimal).
