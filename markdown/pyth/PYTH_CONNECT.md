# 🧐 What is Pyth, anyway?

[Pyth](https://pyth.network) is a protocol which allows publishers to include their price data for various asset pairs or _products_ on the [Solana](https://solana.com) blockchain. There are two concerned parties interacting with the Pyth protocol:

1. **Publishers** who submit their asset pricing data to Pyth.
2. **Consumers** use the price information which is being aggregated by Pyth's on-chain program.

The Pyth on-chain program maintains accounts on Solana which are responsible for tracking the products and their current price data.
It is possible for consumers to interact with this data both on and off-chain, depending on their needs. \
Pyth uses three types of account on Solana:

1. **Product** accounts store the metadata of a product such as its symbol and asset type.
2. **Price** accounts store the current price information of a product, including the **confidence interval**.
3. **Mapping** accounts maintain a linked list of other accounts - this allows applications to easily enumerate the full list of products served by Pyth.

---

When dealing with valuable assets, it is important to be aware of price movements so that you can plan and react accordingly. One of the properties of markets is that there are always fluctuations in asset prices based on supply and demand. Developers can confidently use the high quality, realtime data supplied by Pyth to inform their applications.

The purpose of this pathway is to explain how to use Pyth and give you hands-on experience by incorporating price data into something useful. Together, we are going to build a _liquidation bot_ which will strengthen your understanding of how to visualize the market fluctuations on a chart and perform swaps on a Decentralized Exchange. We're going to start by connecting to Pyth and subscribing to the price data on the Solana blockchain using Pyth's own client library. It's a convenient way to stay current with the on-chain price data.

{% hint style="tip" %}
We encourage you to have completed both the [Solana 101 pathway](https://learn.figment.io/protocols/solana) and [Build a Solana Wallet](https://learn.figment.io/pathways/solana-wallet) before continuing. A working knowledge of React hooks and TypeScript/JavaScript is strongly recommended for this pathway.
{% endhint %}

---

# ⛓ Consuming on-chain data

Pyth provides a few tools to consume the published data. We will use the [JavaScript client](https://github.com/pyth-network/pyth-client-js) `pyth-client-js` which we installed during the setup for this project. The client fetches the prices and returns JavaScript objects which are much easier to work with. It also enables us to listen for price updates which happen during each [slot](https://docs.solana.com/terminology#slot) on Solana (approximately every 400 _milliseconds_).

As you can probably tell, such a high frequency of updates will require us to be careful in how we handle the data.

---

# 🤑 Aggregate price

Aggregate means "formed or calculated by the combination of many separate units". When we refer to an "aggregate price", we mean that the price reported by Pyth is a combination of multiple data points, not just a single source of information. This is a good thing for consumers & developers, as it provides a clear opportunity to avoid the pitfall of acting on incorrect data.

---

# ⏰ Confidence interval

Pyth publishers must supply a confidence interval because in real markets, _there is no single price for a product_ - it is constantly changing based on market activity over time. This is especially true for Cryptocurrency exchanges where assets can be trading at very different prices!

A confidence **interval** is a range of values with an upper bound and a lower bound, computed at a particular confidence **level**.

Publishers who submit their price data to Pyth do not all use the same methods to determine their confidence in a given price. Because of the potential for a small number of publishers to influence the reported price of an asset, it is therefore important to use an _aggregate_ price. The confidence interval published on Pyth is also an aggregated value, based on the confidence intervals being reported by Publishers. It is in the best interests of Publishers to provide high quality data, a confidence interval which is too low can lead to problems for consumers. Publishers do not need to agree with eachother, there may be good reasons for a high confidence interval.
Pyth calculates the price and confidence intervals for all products on a constant basis - Any Publisher behind by 25 slots is considered inactive and their prices are not included in the aggregate until they can catch up, which prevents stale data from being served.

"When consuming Pyth prices, we recommend using the confidence interval to protect your users from these unusual market conditions. The simplest way to do so is to use Pyth's confidence interval to compute a range in which the true price (probably) lies. You obtain this range by adding and subtracting a multiple of the confidence interval to the Pyth price; the bigger the multiple, the more likely the price lies within that range.

We recommend considering a multiple of 3, which gives you a 99.7% probability that the true price is within the range (assuming normal distribution estimates are correct). Then, select the most conservative price within that range for every action. In other words, your protocol should _minimize state changes during times of large price uncertainty_." - Pyth [Best Practices](https://docs.pyth.network/consumers/best-practices)

---

# 🧠 Exponents

Not all price accounts maintain their data in floating point format. Sometimes it is necessary to use an exponent to convert price data from fixed-point to floating point. The readable price (including the decimal, i.e. 150.004731628) is calculated by taking the `price` field from a Pyth price account and multiplying it by `10^exponent`. This will be a negative exponent, which will move the decimal to the left.

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

- To connect to Pyth, use the `PythConnection` class from `@pythnetwork/client` - You'll need to supply a JSON-RPC connection and a Pyth program public key. Seasoned developers may wish to [dive into the code](https://github.com/pyth-network/pyth-client-js/blob/3de72323598131d6d14a9dc9f48f5f225b5fbfd2/src/PythConnection.ts#L29) to see what it's doing.
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
      pythConnection.stop();
    } else {
      message.info('Starting feed!');
      pythConnection.start();
    }
  };
};
//...
```

**What happened in the code above?**

- We created a `connection` instance of the `Connection` class using the `new` constructor, passing the function `clusterApiUrl` which returns the RPC endpoint URL of the given Solana cluster. `PYTH_NETWORKS.DEVNET` is a constant defined in the file `types/index.ts`. Slightly more verbose than supplying the string "devnet", but it is more readable.
- We're passing the `checked` boolean to the `getPythData` function to operate starting/stopping the price feed using the toggle component.
- After registering the `onPriceChange` callback on the `pythConnection`, we can perform any actions necessary for our app to function - Using conditional statements to change the behavior of the app depending on the product symbol, price or confidence interval.
- `\xB1` is the escaped Hex code for the Unicode character `±`, "plus or minus" - indicating the following value is the confidence interval.
- We need to provide a way to stop listening to the price feed, in this case when the toggle switch component is turned off it will call `pythConnection.stop()`, unregistering the callback.

{% hint style="info" %}
If you are interested in seeing the breakdown of the aggregated data, it is available on the `priceComponents` property of the `price` object.
{% endhint %}

---

# ✅ Make sure it works

Once you've made the necessary changes to `components/pyth/components/Connect.tsx` and saved the file, click on the toggle switch labeled "Price feed Off" on the right side of the screen to connect to Pyth & display the current price of the SOL/USD product! Be aware that the queries are being put through a public endpoint and are therefore subject to rate and data limiting - If you leave this price feed running for a while, you will run out of requests and the feed will stop updating. Be sure to switch it off before moving to the next step!

---

# 🏁 Conclusion

We established a connection to the Pyth price feed on Solana using the JavaScript Pyth client and discussed the three main ideas behind the streaming of prices: Aggregate price, confidence interval and the exponent used to convert price data from fixed-point to floating point.

Take a few minutes to learn more about how Pyth's [account structure](https://docs.pyth.network/how-pyth-works/account-structure) & [price aggregation](https://docs.pyth.network/how-pyth-works/price-aggregation) work on the official documentation.
