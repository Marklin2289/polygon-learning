{% hint style="tip" %}
We recommend completing both the [Solana 101 pathway](https://learn.figment.io/protocols/solana) and [Build a Solana Wallet](https://learn.figment.io/pathways/solana-wallet) before continuing. A working knowledge of [React hooks](https://reactjs.org/docs/hooks-intro.html) and [TypeScript/JavaScript](https://www.typescriptlang.org/) is also recommended.
{% endhint %}

# 🦺 Important information for your safety

During this Pathway, we will be providing you with an opportunity to use the Solana [mainnet-beta cluster](https://docs.solana.com/clusters#mainnet-beta) (hereafter referred to as "mainnet") to perform token swaps with [Jupiter](https://jup.ag), a liquidity aggregator for Solana - which means that **actual funds may be used**.

This is **not** a requirement for completing the Pathway & we have made sure to _clearly mark the difference_ between using a wallet containing **devnet SOL** and a wallet containing **mainnet SOL**. Be aware that during the Pathway, you will be asked to input the private key of a **devnet only** wallet, which we will walk you through setting up.

Before proceeding, it is extremely important for you to understand that **in the event you provide the private key of a Solana account containing mainnet SOL to the wallet component in the Pathway, you are potentially risking the full amount of SOL in that account**. Figment is not responsible for your losses in such a scenario, and we have made every effort to communicate the risks involved throughout the Pathway.

There is a wallet component used during the Pathway which has a toggle switch between "mock" and "live". When the toggle is set to "live", you will be able to provide a [Solana keypair private key](https://solana-labs.github.io/solana-web3.js/classes/Keypair.html). Solana keypairs can be created using the Solana CLI, or with the JavaScript API, or even by using a browser extension wallet such as [Phantom](https://phantom.app).

The most important consideration here is that in order to perform _any_ swaps on Solana mainnet using this project, you must:

- Own a funded account on mainnet containing an amount of SOL and the USDC SPL token (a United States Dollar stablecoin)
- Be on Step 6, "Token swaps on a DEX" or Step 7, "Liquidation bot implementation"
- Switch the wallet component from "mock" to "live" & also switch from devnet to mainnet, which will present you with an alert warning you of the hazard
- Copy and paste the private key of your funded account into the textinput of the **live** wallet component

---

# 🧑‍💻 Install the Pyth client

Install the TypeScript/JavaScript library for off-chain applications, such as displaying the Pyth price on a website. Whether you're using Gitpod or a local clone of the repo, the installation procedure is the same. Run the terminal command below inside the root directory of the project (`learn-web3-dapp/`) :

```text
yarn add @pythnetwork/client
```

This Pathway will only cover use of `@pythnetwork/client`. There are also Rust, Python and EVM based clients. Refer to the [list of available client libraries](https://docs.pyth.network/consumers/client-libraries) in the Pyth documentation for links.

---

# 👻 Install the Phantom wallet extension

Turn your favorite browser into a Web3 enabled crypto wallet!

Go to <https://phantom.app> and click on the "Add to ..." button which will autodetect your browser and redirect you to the appropriate extension page:

- Firefox: https://addons.mozilla.org/en-US/firefox/addon/phantom-app/
- Chrome / Brave / Edge: https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en

Optionally, check out <https://phantom.app/security> to learn more about the security features of Phantom.

---

# 🧩 DataHub API keys

To make use of the Pathway content, you will require a DataHub account and a valid API key to access Solana via DataHub's infrastructure. [Sign up for a DataHub account](https://datahub.figment.io/sign_up) and verify your email address.

To use your API key, you must create a new file named `.env.local` in the project root directory: `/learn-web3-dapp/.env.local`, copying the contents of the existing `.env.example` file.

> Easily duplicate the file with the terminal command `cp .env.example .env.local`!

Find your unique API key on the [**DataHub Services Dashboard**](https://datahub.figment.io/). Click on the **Solana** icon in the list of available protocols, then copy your key as shown below:

![](https://raw.githubusercontent.com/figment-networks/learn-web3-dapp/main/markdown/__images__/solana/solana-setup-00.gif?raw=true)

You can then paste your unique API key into `.env.local`, as the value for the environment variable `DATAHUB_SOLANA_API_KEY`. This will authenticate you and enable you to make JSON-RPC requests to Solana via DataHub:

```yaml
# DataHub API keys
DATAHUB_AVALANCHE_API_KEY=
DATAHUB_CELO_API_KEY=
DATAHUB_NEAR_API_KEY=
DATAHUB_POLKADOT_API_KEY=
DATAHUB_POLYGON_API_KEY=
DATAHUB_SECRET_API_KEY=
DATAHUB_SOLANA_API_KEY=81436edcf907b0fbb8493d281cdff5af
DATAHUB_TEZOS_API_KEY=
```

---

# 👣 Next Steps

Once you have your Solana API key saved in `/learn-web3-dapp/.env.local`, you're ready to begin.
Click on the **Next: Connect to Pyth on Solana** button below.
