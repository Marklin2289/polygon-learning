import {SECRET_NETWORKS} from 'types';
import {
  getSafeUrl,
  getDataHubSecretNodeUrl,
} from 'components/protocols/secret/lib';
import {
  EnigmaUtils,
  SigningCosmWasmClient,
  CosmWasmClient,
  Secp256k1Pen,
  pubkeyToAddress,
  encodeSecp256k1Pubkey,
} from 'secretjs';
import {Bip39, Random} from '@iov/crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve('.env.local')});

// Avoid jest open handle error
afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
});

const client = new CosmWasmClient(
  `https://${process.env.DATAHUB_SECRET_TESTNET_RPC_URL}/apikey/${process.env.DATAHUB_SECRET_API_KEY}/`,
);

function getSecretExplorerURL(txHash: string) {
  return `https://secretnodes.com/secret/chains/holodeck-2/transactions/${txHash}`;
}

// const client = new CosmWasmClient(`https://${process.env.DATAHUB_SECRET_TESTNET_RPC_URL}/apikey/${process.env.DATAHUB_SECRET_API_KEY}/`);
// const account = await client.getAccount('secret1ky350glq79hckq42t83nn95dqp7qytg7mct0t4')
// console.log(account)

// const mnemonic = Bip39.encode(Random.getBytes(16)).toString();

// const mnemonic = 'host act ghost cricket hood chat jealous wrestle never bundle host cupboard' // secret1lunvr25hk0eft0yz0l7lh2m4jlal4nrj82yree // NOT FUNDED

// const mnemonic = 'human never dial jelly steel render space snap divide corn absurd carpet' // secret1xj0vca2568e6ac4904sz9djnrwcqh3tgnnsffq // NOT FUNDED
// const mnemonic = 'census liberty team asthma vessel bone axis easy announce lizard powder pipe' // secret1ky350glq79hckq42t83nn95dqp7qytg7mct0t4 // NOT FUNDED
// const mnemonic = 'flavor open minimum dirt oval federal mystery width tumble era session glory' // secret1e992qza002fntfw2z3sg9lkmqgm7vq05y8ap5d // NOT FUNDED
// const mnemonic = 'suspect force foster space glory talent minor holiday royal success wage sugar' // secret1yfzv88xfwue5s59fuzgp8w5mqc87ctvqcr6xzn // NOT FUNDED

// const mnemonic = 'insane where wheat like rigid boost diagram during coach hour firm now' // secret1l522xsm9p7v2gv4ghrzly9yncujml86fx5ed4w // FUNDED
// const mnemonic = 'soldier wine cage pull drive grow couple govern fold monitor crowd cool' // secret1j78nwlf6grpzhru2cwaacr43e5rsgvx3dn095t // FUNDED
// const mnemonic = 'total matter sound cream galaxy punch inject corn dismiss earth myself add' // secret18px8a9gzug2e58w9q9jcp7nhw87usxqxauwjqu // FUNDED
// const mnemonic = 'much mixture used glide shiver awful deer tobacco enact draft whisper spike' // secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v // FUNDED

async function connection_step() {
  return await client.restClient.nodeInfo();
}

async function keypair_step(mnemonic: string, forcerandom: boolean) {
  if (forcerandom === true) {
    const randomMnemonic = Bip39.encode(Random.getBytes(16)).toString();
    console.log('Random mnemonic:', randomMnemonic);
    const signingPen = await Secp256k1Pen.fromMnemonic(randomMnemonic);
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    const address = pubkeyToAddress(pubkey, 'secret');
    console.log('Address of random mnemonic:', address);
    return address as string;
  } else if (forcerandom === false) {
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    const address = pubkeyToAddress(pubkey, 'secret');
    return address as string;
  }
}

async function not_funded_balance_step(mnemonic: string) {
  try {
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const address = pubkeyToAddress(
      encodeSecp256k1Pubkey(signingPen.pubkey),
      'secret',
    );
    const account = await client.getAccount(
      'secret1xj0vca2568e6ac4904sz9djnrwcqh3tgnnsffq',
    );
    const balance = account?.balance[0].amount as string;
    console.log('(Not Funded) Account:', account, '<-- Should be undefined');
    console.log(
      `\(Not Funded\) Balance of ${address}:`,
      balance,
      `<-- Should be undefined`,
    );
    return balance;
  } catch (error) {
    console.log('Not Funded step error:', error);
  }
}

async function funded_balance_step(mnemonic: string) {
  try {
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const address = pubkeyToAddress(
      encodeSecp256k1Pubkey(signingPen.pubkey),
      'secret',
    );
    console.log('Funded address:', address);
    console.log(client);
    const account = await client.getAccount(address);
    const balance = account?.balance[0].amount as string;
    console.log('(Funded) Account:', account);
    console.log(
      `\(Funded\) Balance of ${address}:`,
      balance,
      `<-- Should be non-zero`,
    );
    return balance as string;
  } catch (error) {
    console.log('Funded Balance step error:', error);
  }
}

async function balance_after_transfer_step(mnemonic: string) {
  try {
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const address = pubkeyToAddress(
      encodeSecp256k1Pubkey(signingPen.pubkey),
      'secret',
    );
    console.log('Recipient address:', address);
    console.log(client);
    const account = await client.getAccount(address);
    const balance = account?.balance[0].amount as string;
    console.log('(Funded) Account:', account);
    console.log(
      `\(Funded\) Balance of ${address}:`,
      balance,
      `<-- Should be non-zero, less than previous balance`,
    );
    return balance as string;
  } catch (error) {
    console.log('Funded Balance step error:', error);
  }
}

// This has been successful with a fresh funded account, but more than one transfer causes an error ?
async function transfer_step(to_mnemonic: string, from_mnemonic: string) {
  const url = await getSafeUrl();
  const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();
  const TX_AMOUNT = '100000';

  const memo = 'sendTokens example'; // Optional memo

  const fees = {
    send: {
      amount: [{amount: '80000', denom: 'uscrt'}],
      gas: '80000',
    },
  };

  const signingPenFunded = await Secp256k1Pen.fromMnemonic(from_mnemonic);
  const senderAddress = pubkeyToAddress(
    encodeSecp256k1Pubkey(signingPenFunded.pubkey),
    'secret',
  ) as string;
  console.log('Funded SigningPen:', signingPenFunded);
  console.log('Sending from:', senderAddress);

  const signingPenNotFunded = await Secp256k1Pen.fromMnemonic(to_mnemonic);
  const receiverAddress = pubkeyToAddress(
    encodeSecp256k1Pubkey(signingPenNotFunded.pubkey),
    'secret',
  ) as string;
  console.log('Not Funded SigningPan:', signingPenNotFunded);
  console.log('Sending to:', receiverAddress);

  const client = new SigningCosmWasmClient(
    url as string,
    senderAddress as string,
    (signBytes) => signingPenFunded.sign(signBytes),
    txEncryptionSeed,
    fees,
  );

  const sent = await client.sendTokens(
    receiverAddress as string,
    [
      {
        amount: TX_AMOUNT,
        denom: 'uscrt',
      },
    ],
    memo,
  );

  console.log(
    `${JSON.stringify(sent, null, 2)} : ${senderAddress} to ${receiverAddress}`,
  );
  return sent;
}

/**
 *  Test cases
 */

// Attempting to check the balance of a funded account separately from the other test cases
describe('Funded balance check', () => {
  test('Funded balance of an account', async () => {
    await expect(
      funded_balance_step(
        'insane where wheat like rigid boost diagram during coach hour firm now',
      ),
    ).resolves.toBeDefined();
  });
});

describe('Secret backend tests', () => {
  // Avoid jest open handle error
  jest.setTimeout(30000);

  test('Connection step', async () => {
    await expect(connection_step()).resolves.toHaveProperty(
      'application_version.version',
    );
  });

  test('Random Keypair step', async () => {
    await expect(keypair_step('', true)).resolves.toHaveLength(45);
  });

  test('Keypair step', async () => {
    await expect(
      keypair_step(
        'total matter sound cream galaxy punch inject corn dismiss earth myself add',
        false,
      ),
    ).resolves.toHaveLength(45);
  });

  test('Funded Balance step', async () => {
    await expect(
      funded_balance_step(
        'much mixture used glide shiver awful deer tobacco enact draft whisper spike',
      ), // secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v
    ).resolves.toBeDefined();
  });

  test('Not Funded Balance step', async () => {
    await expect(
      not_funded_balance_step(
        'human never dial jelly steel render space snap divide corn absurd carpet',
      ), // secret1xj0vca2568e6ac4904sz9djnrwcqh3tgnnsffq
    ).resolves.toBeUndefined();
  });

  test('Transfer step', async () => {
    await expect(
      transfer_step(
        'host act ghost cricket hood chat jealous wrestle never bundle host cupboard',
        'much mixture used glide shiver awful deer tobacco enact draft whisper spike',
      ),
    ).resolves.toBeDefined();
  });

  test('BalanceAfter step', async () => {
    await expect(
      balance_after_transfer_step(
        'much mixture used glide shiver awful deer tobacco enact draft whisper spike',
      ),
    ).resolves.toBeDefined();
  });
});

/**
 * Outputs:

  console.log
    Random mnemonic: copy lucky loyal toilet write melody age crazy slush journey summer help

      at keypair_step (__test__/secret.test.ts:45:13)

  console.log
    Address of random mnemonic: secret1p4lna8lsmfgewx0svschzqdl0rrh5xnxluujmn

      at keypair_step (__test__/secret.test.ts:49:13)

  console.log
    (Not Funded) Account: undefined <-- Should be undefined

      at not_funded_balance_step (__test__/secret.test.ts:67:13)

  console.log
    (Not Funded) Balance of secret1xj0vca2568e6ac4904sz9djnrwcqh3tgnnsffq: undefined <-- Should be undefined

      at not_funded_balance_step (__test__/secret.test.ts:68:13)

  console.log
    Funded address: secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v

      at funded_balance_step (__test__/secret.test.ts:79:13)

  console.log
    CosmWasmClient {
      codesCache: Map(0) {},
      restClient: RestClient {
        client: [Function: wrap] {
          request: [Function: wrap],
          getUri: [Function: wrap],
          delete: [Function: wrap],
          get: [Function: wrap],
          head: [Function: wrap],
          options: [Function: wrap],
          post: [Function: wrap],
          put: [Function: wrap],
          patch: [Function: wrap],
          defaults: [Object],
          interceptors: [Object]
        },
        broadcastMode: 'block',
        enigmautils: EnigmaUtils {
          consensusIoPubKey: Uint8Array(0) [],
          apiUrl: 'https://secret-holodeck-2--lcd--full.datahub.figment.io/apikey/0af2060ee3f95211ea360762502f729d/',
          seed: [Uint8Array],
          privkey: [Uint8Array],
          pubkey: [Uint8Array]
        },
        codeHashCache: Map(0) {}
      }
    }

      at funded_balance_step (__test__/secret.test.ts:80:13)

  console.log
    (Funded) Account: {
      address: 'secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v',
      balance: [ { denom: 'uscrt', amount: '100000000' } ],
      pubkey: undefined,
      accountNumber: 14600,
      sequence: 0
    }

      at funded_balance_step (__test__/secret.test.ts:85:13)

  console.log
    (Funded) Balance of secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v: 100000000 <-- Should be non-zero

      at funded_balance_step (__test__/secret.test.ts:86:13)

  console.log
    Funded SigningPen: Secp256k1Pen {
      privkey: Uint8Array(32) [
        161,  71, 120, 183, 243,  58, 158, 169,
          9,  89,   8,  20, 114, 177, 107, 177,
        240, 202, 126, 254, 213, 114, 206, 255,
        227,  62, 159, 184,  60, 195,  18, 247
      ],
      pubkey: Uint8Array(33) [
          2, 121, 228, 148, 214,  84,  60, 125,
         64,  99,  17, 138, 153, 123, 254,  45,
          4,  66, 107, 243, 223,  91, 203, 106,
        234,  73, 153,   0,  99, 205, 166, 229,
        127
      ]
    }

      at transfer_step (__test__/secret.test.ts:126:11)

  console.log
    Sending from: secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v

      at transfer_step (__test__/secret.test.ts:127:11)

  console.log
    Not Funded SigningPan: Secp256k1Pen {
      privkey: Uint8Array(32) [
        184, 235, 137, 119, 178,  88,  52, 102,
         63, 161, 116, 204, 158,  20,  40, 164,
         24, 194,  62,  73, 231,  59, 221,  35,
        236, 152,  66,  83, 114, 157, 211, 190
      ],
      pubkey: Uint8Array(33) [
          2,  39,  40, 76, 123, 125,   8,  81,
         27, 192,  44, 24, 196, 234, 232, 127,
        231, 215, 237, 36,  29, 235, 177, 191,
         55,   8,  22, 18,  42, 243,  23, 162,
        105
      ]
    }

      at transfer_step (__test__/secret.test.ts:131:11)

  console.log
    Sending to: secret1lunvr25hk0eft0yz0l7lh2m4jlal4nrj82yree

      at transfer_step (__test__/secret.test.ts:132:11)

  console.log
    {
      "logs": [
        {
          "msg_index": 0,
          "log": "",
          "events": [
            {
              "type": "message",
              "attributes": [
                {
                  "key": "action",
                  "value": "send"
                },
                {
                  "key": "sender",
                  "value": "secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v"
                },
                {
                  "key": "module",
                  "value": "bank"
                }
              ]
            },
            {
              "type": "transfer",
              "attributes": [
                {
                  "key": "recipient",
                  "value": "secret1lunvr25hk0eft0yz0l7lh2m4jlal4nrj82yree"
                },
                {
                  "key": "amount",
                  "value": "100000uscrt"
                }
              ]
            }
          ]
        }
      ],
      "rawLog": "[{\"msg_index\":0,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"send\"},{\"key\":\"sender\",\"value\":\"secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"secret1lunvr25hk0eft0yz0l7lh2m4jlal4nrj82yree\"},{\"key\":\"amount\",\"value\":\"100000uscrt\"}]}]}]",
      "transactionHash": "C9A0D5DF79EDB6071EDE97D666A4AC721A06EDA6EB8E0E45A2F97F1E0161D7A6",
      "data": ""
    } : secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v to secret1lunvr25hk0eft0yz0l7lh2m4jlal4nrj82yree

      at transfer_step (__test__/secret.test.ts:153:11)

  console.log
    Funded address: secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v

      at balance_after_transfer_step (__test__/secret.test.ts:97:13)

  console.log
    CosmWasmClient {
      codesCache: Map(0) {},
      restClient: RestClient {
        client: [Function: wrap] {
          request: [Function: wrap],
          getUri: [Function: wrap],
          delete: [Function: wrap],
          get: [Function: wrap],
          head: [Function: wrap],
          options: [Function: wrap],
          post: [Function: wrap],
          put: [Function: wrap],
          patch: [Function: wrap],
          defaults: [Object],
          interceptors: [Object]
        },
        broadcastMode: 'block',
        enigmautils: EnigmaUtils {
          consensusIoPubKey: Uint8Array(0) [],
          apiUrl: 'https://secret-holodeck-2--lcd--full.datahub.figment.io/apikey/0af2060ee3f95211ea360762502f729d/',
          seed: [Uint8Array],
          privkey: [Uint8Array],
          pubkey: [Uint8Array]
        },
        codeHashCache: Map(0) {}
      },
      anyValidAddress: 'secret19tu6gk7l9j6wz4r4z5z404uk9k47pja5z6pn0v'
    }

      at balance_after_transfer_step (__test__/secret.test.ts:98:13)

 FAIL  __test__/secret.test.ts (8.323 s)
  Secret backend tests
    ✓ Connection step (342 ms)
    ✓ Random Keypair step (234 ms)
    ✓ Keypair step (176 ms)
    ✓ Not Funded Balance step (390 ms)
    ✓ Funded Balance step (466 ms)
    ✓ Transfer step (4864 ms)
    ✕ BalanceAfter step (479 ms)

  ● Secret backend tests › BalanceAfter step

    expect(received).resolves.toBeDefined()

    Received: undefined

      194 |     await expect(
      195 |       balance_after_transfer_step('much mixture used glide shiver awful deer tobacco enact draft whisper spike'),
    > 196 |     ).resolves.toBeDefined();
          |                ^
      197 |   });
      198 | });
      199 |

      at Object.toBeDefined (node_modules/expect/build/index.js:242:22)
      at Object.<anonymous> (__test__/secret.test.ts:196:16)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 6 passed, 7 total
Snapshots:   0 total
Time:        8.6 s
Ran all test suites related to changed files.

Watch Usage: Press w to show more.  console.log
    Funded Balance step error: Error: Unsupported Pubkey type. Amino prefix: eb5ae98721
        at Object.decodeBech32Pubkey (/Users/rogan/Projects/learn-web3-dapp/node_modules/secretjs/src/pubkey.ts:54:11)
        at CosmWasmClient.getAccount (/Users/rogan/Projects/learn-web3-dapp/node_modules/secretjs/src/cosmwasmclient.ts:241:36)
        at processTicksAndRejections (node:internal/process/task_queues:96:5)
        at balance_after_transfer_step (/Users/rogan/Projects/learn-web3-dapp/__test__/secret.test.ts:99:21)
        at Object.<anonymous> (/Users/rogan/Projects/learn-web3-dapp/__test__/secret.test.ts:194:5)

      at balance_after_transfer_step (__test__/secret.test.ts:105:13)


      ****************************************************************
      * NOTE:   I am not sure why the Unsupported Pubkey type error occurs. Perhaps it has to do with
      *         the caching that CosmWasmClient is doing. I really cannot tell, but as you can see from this logging output, the tests run successfully with
      *         the exception of the post-transfer balance check.
      *         From what I can tell, the issue is with the line : const account = await client.getAccount(address) - even when passing it a valid address it fails sometimes.

 */
