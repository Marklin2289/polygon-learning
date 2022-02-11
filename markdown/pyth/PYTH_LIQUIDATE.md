# 🔩 Bolting it all together

Now it's time to bring all the functionality that we've completed together and try out the working liquidation bot with mock swaps!

If you recall, at the beginning of the pathway we laid out the various topics we would need to touch on to make this project. At every step, we provided you with measured amounts of learning and a chance to solidify that learning by completing a small coding challenge related to the task at hand. Here is a quick recap of how the components fit together:

- We have a component that can toggle our Pyth price feed on and off as needed to start and stop the bot.
- We've got an account display, the "Wallet" component which shows us how many tokens the bot has access to, real or not. We can supply a private key to give the bot complete authority to swap these tokens on our behalf.
- There's a Chart component to display the price data, so that we know which way the market is moving. Knowledge is power!
- We've got an order book and a way to generate token swap transactions based on the Exponential moving average and execute them on a DEX.

The file `components/protocols/pyth/components/Liquidate.tsx` is being rendered on the right side of the page. You should be familiar with the imports by now. We're bringing in the `pythConnection` that we worked on in the first step to fetch our price data from the Solana cluster. We'll be using the `price` state variable, and the `yieldExpectation`. Each `useEffect` in this component is commented, explaining what they're doing.

---

# 🎠 Playground time

There is no code challenge for this step, at this point you should be familiar with all the components necessary to make use of Pyth price data!

You can try out the complete liquidation bot using the mock wallet and mock swaps right away. Keep in mind that the buy and sell signals are being buffered for 10 seconds before the trend is calculated and the bot decides to buy USDC or sell SOL. The mock swaps are still using the mainnet routes being fetched from Jupiter.

---

# ✅ Make sure it works

Before turning on the price feed, be sure to have some ORCA tokens. Otherwise, the liquidation bot will fail to perform its assigned task because it will get hung up trying to swap an exact amount. Without some extra ORCA to pay for the pool fees, failed swaps will start piling up.

Armed and ready? Now it's time to toggle the price feed on and watch the liquidation bot go to work!

The chart will populate with the ongoing price feed, and the bot will make buy & sell orders depending on the signals being emitted as events by the `eventListener`. This is all going to happen very quickly, but don't be afraid to let it run for a short time before toggling the price feed off to inspect the sequence of events.

For every instance where the order book has been updated, the bot will attempt to make the appropriate trade. If everything is working as it should, you'll see the amounts of SOL & USDC update as the swaps are completed.

If you want to alter the yield expectation, it's best to turn off the price feed first.

It is also handy to have a peek at the dev tools console in your browser to see a little more information about the swaps. In Firefox, open the Web Developer Tools. In Chrome, they're just called Developer Tools. In both browsers, simply right click on the page and select **Inspect** from the context menu, then click on the **Console** tab in the Developer Tools window. Now you can see the output of the informative `console.log` statements we included in the code 🚀

---

# 🏁 Conclusion

Congratulations, you now have a very basic yet functional liquidation bot which depends on Pyth price data to make token swaps on a DEX! There are many ways in which you might seek to improve on this functionality - whether it's just an improved front-end design or implementing a more stringent algorithm for trading.
