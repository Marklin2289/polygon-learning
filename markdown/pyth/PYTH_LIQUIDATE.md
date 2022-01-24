# 🔩 Bolting it all together

Now it's time to bring all the functionality together and try out the working liquidation bot (on devnet!)

This is how the components fit together:

- The file `components/protocols/pyth/components/Liquidate.tsx` is being rendered on the right side of the page. You should be familiar with the imports by now.
- We're bringing in the `pythConnection` that we worked on in the first step to fetch our price data from the Solana cluster.
- We'll be using the `price` state variable, and the `yieldExpectation`.
- Each `useEffect` has comments in the code explaining what they're doing.

---

# 🏋️ Challenge

{% hint style="tip" %}
In `components/pyth/components/Liquidate.tsx`, implement X.
{% endhint %}

**Take a few minutes to figure this out**

```typescript
//...

//...
```

**Need some help?** Check out these hints 👇

- ?

Still not sure how to do this? No problem! The solution is below so you don't get stuck.

---

# 😅 Solution

```typescript
// solution
//...

//...
```

**What happened in the code above?**

- ?

---

# ✅ Make sure it works

Before turning on the price feed, be sure to switch to the **live wallet** on devnet and paste in the private key of the keypair we created earlier, and funded with SOL & USDC.

Now it's time to toggle the price feed on and watch the liquidation bot work!

The chart will populate with the ongoing price feed, and the bot will make buy & sell orders depending on the signals being emitted as events by the `eventListener`.

For every instance where the order book has been updated, the bot will attempt to make the appropriate trade. If everything is working as it should, you'll see the amounts of SOL, USDC and ORCA update as the swaps are completed.

If you want to alter the yield expectation, it's best to turn off the price feed first.

---

# 🏁 Conclusion

Congratulations, you now have a functional yet very basic liquidation bot which depends on Pyth price data to make token swaps on a DEX! There are many ways in which you might seek to improve on this functionality - whether it's just a sleek design or implementing a more stringent algorithm for trading.
