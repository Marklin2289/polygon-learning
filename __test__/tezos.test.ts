import {TezosToolkit} from '@taquito/taquito';
import {validateChain} from '@taquito/utils';
import {importKey} from '@taquito/signer';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve('.env.local')});

// Avoid jest open handle error
afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
});

var contractAddress: any = undefined;

const getTezosUrl = (): string =>
  `https://${process.env.DATAHUB_TEZOS_TESTNET_URL}/apikey/${process.env.DATAHUB_TEZOS_API_KEY}`;

const FAUCET_KEY = {
  mnemonic: [
    'creek',
    'glide',
    'junior',
    'notice',
    'habit',
    'defy',
    'ugly',
    'piano',
    'vendor',
    'custom',
    'better',
    'begin',
    'tenant',
    'image',
    'torch',
  ],
  secret: '5259d2f35d43d8471cee7b319756ed422d1740fd',
  amount: '22807046338',
  pkh: 'tz1b6xMDk43FXxWjcj6Y6HmaJFi2BJ4Sktja',
  password: 'ouduUzxsBk',
  email: 'qkwfzysa.oiaaafsa@tezos.example.org',
};

const FAUCET_KEY_2 = {
  mnemonic: [
    'offer',
    'champion',
    'win',
    'much',
    'exercise',
    'cabbage',
    'auto',
    'gun',
    'sport',
    'firm',
    'gap',
    'there',
    'era',
    'tragic',
    'attack',
  ],
  secret: 'ca3ce2ef5866ce06dea5b3b21ec101e25201a197',
  amount: '18967028539',
  pkh: 'tz1M36qDcf4QFLmTgkT5vGQFBqjyck52LPD7',
  password: 'A9MqZbyyXl',
  email: 'lqctvqza.yomtczgd@tezos.example.org',
};

const CONTRACT_JSON = [
  {
    prim: 'parameter',
    args: [
      {
        prim: 'or',
        args: [
          {prim: 'int', annots: ['%decrement']},
          {prim: 'int', annots: ['%increment']},
        ],
      },
    ],
  },
  {prim: 'storage', args: [{prim: 'int'}]},
  {
    prim: 'code',
    args: [
      [
        {prim: 'UNPAIR'},
        {
          prim: 'IF_LEFT',
          args: [[{prim: 'SWAP'}, {prim: 'SUB'}], [{prim: 'ADD'}]],
        },
        {prim: 'NIL', args: [{prim: 'operation'}]},
        {prim: 'PAIR'},
      ],
    ],
  },
];

async function connection_step() {
  try {
    const url = getTezosUrl();
    const Tezos = new TezosToolkit(url);
    const chainId = await Tezos.rpc.getChainId();
    return validateChain(chainId);
  } catch (error) {
    console.log(error);
  }
}

async function balance_step() {
  try {
    const url = getTezosUrl();
    const tezos = new TezosToolkit(url);
    return await tezos.tz.getBalance(FAUCET_KEY.pkh);
  } catch (error) {
    console.log(error);
  }
}

// This step can potentially take a long time awaiting confirmation
// which is why jest.setTimeout(120000) has been set for the test cases
async function transfer_step() {
  const url = getTezosUrl();
  const Tezos = new TezosToolkit(url);
  const amount = 2;

  // This method avoids using the InMemorySigner and base58encoding the secret
  // but still has the effect of signing the transaction
  await importKey(
    Tezos,
    FAUCET_KEY.email,
    FAUCET_KEY.password,
    FAUCET_KEY.mnemonic.join(' '),
    FAUCET_KEY.secret,
  );

  // Example of a successful transfer:
  // https://florence.tzstats.com/oowiiNdeRGh4TSgRSC23CTGafQGf1UyHNFR3DdUAhLjPg27y7PN
  await Tezos.contract
    .transfer({
      to: FAUCET_KEY_2.pkh,
      amount: amount,
    })
    .then(async (op) => {
      console.log(`Transferring ${amount} ꜩ to ${FAUCET_KEY_2.pkh}`);
      console.log(`Waiting for ${op.hash} to be confirmed...`);
      await op.confirmation(1).then(() => {
        console.log(
          `Operation injected: https://florence.tzstats.com/${op.hash}`,
        );
      });
    });
  return true;
}

async function deploy_step() {
  try {
    const url = getTezosUrl();
    const Tezos = new TezosToolkit(url);
    await importKey(
      Tezos,
      FAUCET_KEY.email,
      FAUCET_KEY.password,
      FAUCET_KEY.mnemonic.join(' '),
      FAUCET_KEY.secret,
    );
    const operation = await Tezos.contract.originate({
      code: CONTRACT_JSON,
      storage: 0,
    });
    const contract = await operation.contract();
    contractAddress = contract.address;
    console.log(
      `Contract deployed: https://florence.tzstats.com/${contractAddress}`,
    );
    const counter = await Tezos.contract.getStorage(contract.address);
    console.log(counter);
    return contract.address;
  } catch (error) {
    console.log(error);
  }
}

async function getter_step() {
  try {
    const url = getTezosUrl();
    const Tezos = new TezosToolkit(url);
    await importKey(
      Tezos,
      FAUCET_KEY.email,
      FAUCET_KEY.password,
      FAUCET_KEY.mnemonic.join(' '),
      FAUCET_KEY.secret,
    );
    console.log('Getting storage of contract:', contractAddress);
    const counter = await Tezos.contract.getStorage(contractAddress);
    console.log(counter);
    return counter;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Test cases
 */

describe('Tezos backend tests', () => {
  // Avoid jest open handle error
  jest.setTimeout(120000);

  test('Connection step', async () => {
    // validateChain returns 3 if the chainId is valid
    await expect(connection_step()).resolves.toBe(3);
  });

  test('Balance step', async () => {
    // BigNumber objects contain the number in the c property:
    // BigNumber { s: 1, e: 10, c: [ 22730964817 ] }
    await expect(balance_step()).resolves.toHaveProperty('c');
  });

  test('Transfer step', async () => {
    return expect(transfer_step()).resolves.toBeTruthy();
  });

  test('Deploy step', async () => {
    return expect(deploy_step()).resolves.toBeDefined();
  });

  test('Getter step', async () => {
    return expect(getter_step()).resolves.toBeDefined();
  });
});
