# 🦊 Install the Pyth client

Install the Typescript/Javascript library for off-chain applications, such as displaying the Pyth price on a website.

```text
npm install --save @pythnetwork/client
```

---

# 🧩 DataHub API keys

To make use of the Pathway content, you will require a DataHub account and a valid API key to access Solana via DataHub's infrastructure. [Sign up for a DataHub account](https://datahub.figment.io/sign_up) and verify your email address.

To use your API key, you must create a new file named `.env.local` in the project root directory: `/learn-web3-dapp/.env.local`, copying the contents of the existing `.env.example` file.

> Easily duplicate the file with the terminal command `cp .env.example .env.local`!

Find your unique API key on the [**DataHub Services Dashboard**](https://datahub.figment.io/). Click on the **Polygon** icon in the list of available protocols, then copy your key as shown below:

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
Click on the **Next: Query Pyth on Solana** button below.
