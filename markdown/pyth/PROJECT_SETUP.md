# 🦺 Important information for your safety

During this Pathway, we will be providing you with an opportunity to use the mainnet-beta cluster of Solana to perform token swaps with [Jupiter](https://jup.ag), a liquidity aggregator for Solana - which means that **actual funds may be used**.

This is **not** a requirement for completing the Pathway & we have made sure to _clearly mark the difference_ between using a wallet containing **devnet SOL** and a wallet containing **mainnet-beta SOL**. Be aware that during the Pathway, you will be asked to input the private key of a **devnet only** wallet, which we will walk you through setting up.

Before proceeding, it is extremely important for you to understand that **in the event you provide the private key of a mainnet-beta Solana account containing real money SOL to the wallet component in the Pathway, you are potentially risking the full amount of SOL in that account**. Figment is not responsible for your losses in such a scenario, and we have made every effort to communicate the risks involved throughout the Pathway.

There is a wallet component used during the pathway which has a toggle switch between "mock" and "live". When the toggle is set to "live", you will be able to provide a [Solana keypair secret key](https://solana-labs.github.io/solana-web3.js/classes/Keypair.html) in the form of a byte array. Solana keypairs can be created using the Solana CLI, or with the JavaScript API, or even by using a browser extension wallet such as [Phantom](https://phantom.app).

The most important consideration here is that in order to perform _any_ swaps on mainnet-beta using this project, you must:

- Own a funded account on mainnet-beta containing an amount of SOL and the SPL token USDC (a United States Dollar stablecoin)
- Switch the wallet component from "mock" to "live", which will present you with an alert warning you of the hazard of proceeding
- Copy and paste the secret key of your funded account it into the textinput of the **live** wallet component

**REMEMBER: THIS SERIES OF TUTORIALS IS FOR EDUCATIONAL PURPOSES ONLY!**

---

# 🧑‍💻 Install the Pyth client

Install the Typescript/Javascript library for off-chain applications, such as displaying the Pyth price on a website.

Whether you're using Gitpod or a local clone of the repo, the installation procedure is the same. Run the terminal command below inside the root directory of the project (`learn-web3-dapp/`) :

```text
yarn add @pythnetwork/client
```

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
