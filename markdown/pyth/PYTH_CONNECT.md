In this tutorial, we're going to interact with Pyth price data on the Solana blockchain using Pyth's own client library: `@pythnetwork/client` ([link](https://github.com/pyth-network/pyth-client-js)). It's a convenient way to interface with the on-chain price feed when building an application. We will explore it together as we add features to our app. By the end of this Pathway you will have built a working _liquidation bot_, which uses the aggregated price data supplied by Pyth.

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

# ⏰ Confidence interval

Pyth publishes a confidence interval because in real markets, there is not a single price for a product - it is constantly changing based on market activity over a period of time.

Publishers who submit their price data to Pyth do not all use the same methods to determine their confidence in a given price. Because of the potential for a small number of publishers to influence the reported price of an asset, it is therefore important to use an _aggregated_ price. The **confidence interval** reported by Pyth represents the aggregated confidence interval being reported by Publishers. A price above or below the aggregated price interval of a product is an outlier. It is in the best interests of Publishers to provide high quality data, and so a confidence interval which is too high or low will lead to problems. Publishers do not always need to agree with eachother, there might be a good reason for a high confidence interval. Pyth calculates the price and confidence intervals for all products on a constant basis - Any Publisher behind by 25 slots is removed from the data pool until they can catch up, which prevents stale data from being served.

Read more about how [Pyth price aggregation](https://docs.pyth.network/how-pyth-works/price-aggregation) works on the official documentation.

---

# ⛓ Working with on-chain data

Pyth provides us with a few tools to consume the published data. For working with price feeds, there is the [JavaScript client](https://github.com/pyth-network/pyth-client-js) `pyth-client-js` which we installed during the setup for this project.

There is also a [Rust client](https://github.com/pyth-network/pyth-client-rs), which can be used in on-chain program development, and a [Neon EVM](https://github.com/pyth-network/pyth-neon) client that provides access to Pyth data through Solidity smart contracts. A Python client is coming soon, as well.

Finally, there is a client API for on-chain Pyth programs, [pyth-client](https://github.com/pyth-network/pyth-client).

---

# 🏋️ Challenge

{% hint style="tip" %}
In `components/pyth/components/Connect.tsx`, implement `getPythData` by creating a `pythConnection` instance and registering the `onPriceChange` callback. You must replace the instances of `undefined` with working code to accomplish this.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...
  const getPythData = async (checked: boolean) => {
    const SOLANA_CLUSTER_NAME: Cluster = 'devnet';
    const connection = new Connection(clusterApiUrl(SOLANA_CLUSTER_NAME));
    const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME);
    const pythConnection = new PythConnection(connection, pythPublicKey);
    pythConnection.onPriceChange((product, price) => {
      // sample output:
      // SRM/USD: $8.68725 ±$0.0131
      if (product.symbol === "Crypto.SOL/USD" && price.price && price.confidence) {



//...
```

**Need some help?** Check out these links 👇

- [Creating a `Connection` instance](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#constructor)
- [Getting the API `version`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getversion)

Still not sure how to do this? No problem! The solution is below so you don't get stuck.

---

# 😅 Solution

```typescript
// solution
//...
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
    }
  };
//...
```

**What happened in the code above?**

- We created a `connection` instance of the `Connection` class using the `new` constructor.
- We then call `getVersion` on that `connection` instance. The docs state that `connection.getVersion` returns a Promise, so remember to use the `await` syntax.

---

# ✅ Make sure it works

Once you've made the necessary changes to `pages/api/pyth/connect.ts` and saved the file, click on the blue 'power icon' button on the right side of the screen to connect & display the current version of the Solana node!

---

# 🏁 Conclusion

We established our connection to the Pyth price feed and discussed the three major ideas behind the streaming of prices: Aggregate price, confidence interval and the exponent used to calculate the price including the decimal.
