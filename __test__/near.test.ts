// import {configFromNetwork} from '@near/lib';
import {InMemoryKeyStore} from 'near-api-js/lib/key_stores';
import {keyStores, ConnectConfig, KeyPair, connect} from 'near-api-js';
import {parseNearAmount} from 'near-api-js/lib/utils/format';
import PublicKey from 'near-api-js/lib/utils/key_pair';
import dotenv from 'dotenv';
import path from 'path';
import BN from 'bn.js';

dotenv.config({path: path.resolve('.env.local')});

enum NEAR_NETWORKS {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

const networkfromString = (network: string): NEAR_NETWORKS =>
  network === 'mainnet' ? NEAR_NETWORKS.MAINNET : NEAR_NETWORKS.TESTNET;

const networkfromEnum = (network: NEAR_NETWORKS): string =>
  network === NEAR_NETWORKS.MAINNET ? 'mainnet' : 'testnet';

const getDataHubNearNodeUrl = (network = NEAR_NETWORKS.TESTNET): string =>
  network === NEAR_NETWORKS.MAINNET
    ? `https://${process.env.DATAHUB_NEAR_MAINNET_RPC_URL}/apikey/${process.env.DATAHUB_NEAR_API_KEY}`
    : `https://${process.env.DATAHUB_NEAR_TESTNET_RPC_URL}/apikey/${process.env.DATAHUB_NEAR_API_KEY}`;

export const configFromNetwork = (networkId: string): ConnectConfig => {
  const walletUrl: string = `https://wallet.${networkId}.near.org`;
  const helperUrl: string = `https://helper.${networkId}.near.org`;
  // const nodeUrl: string = getDataHubNearNodeUrl(networkfromString(networkId));
  const nodeUrl: string = `https://archival-rpc.${networkId}.near.org`; // Uses archival RPC to avoid "TypedError: [-32000] Server error: The node does not track the shard ID 0"
  const keyStore: InMemoryKeyStore = new keyStores.InMemoryKeyStore();
  const config = {
    keyStore,
    networkId,
    nodeUrl,
    helperUrl,
    walletUrl,
  };
  return config;
};

function getRandomString(length: number) {
  var randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length),
    );
  }
  return result;
}

const fakename = `${getRandomString(16).toLocaleLowerCase()}`;
var secret_key: any = undefined;

async function connection_step(network: string) {
  const config = configFromNetwork(network);
  const near = await connect(config);
  const provider = near.connection.provider;
  const status = await provider.status();
  return status.version.version;
}

async function keypair_step() {
  const keypair = KeyPair.fromRandom('ed25519');
  const secret = keypair.toString();
  return secret;
}

async function keypair_create(force: boolean) {
  if (force === false) {
    return KeyPair.fromRandom('ed25519') as KeyPair;
  } else if (force === true) {
    return KeyPair.fromRandom('ed25519').toString() as string;
  }
}

async function nonexistent_account_check_step(
  account: string,
  network: string,
) {
  console.log(account);
  const config = configFromNetwork(network);
  const near = await connect(config);
  const accountString = `${account}.${network}`;
  console.log(accountString);
  const accountInfo = await near.account(accountString);

  try {
    const state = await accountInfo.state();
    console.log(
      `Account ${account}.${network} exists! This should not occur.`,
      state,
    );
    return false;
  } catch (error: any) {
    if (
      error.type === 'UntypedError' &&
      error.message ==
        'TypedError: [-32000] Server error: The node does not track the shard ID 0'
    ) {
      console.log(error);
      return false;
    } else if (error.type === 'AccountDoesNotExist') {
      return true;
    } else {
      console.log(error);
      return false;
    }
  }
}

async function create_account_step(account: string, network: string) {
  const config = configFromNetwork(network);
  const near = await connect(config);
  // const keyPair = await keypair_create(false);
  const keyPair = KeyPair.fromRandom('ed25519') as KeyPair;
  const publicKey = keyPair.getPublicKey();
  secret_key = keyPair.toString() as string;
  const newAccount = await near.createAccount(account, publicKey);
  console.log('Created account ID:', newAccount.accountId);
  console.log('With secret key:', secret_key);
  config.keyStore?.setKey('testnet', account, keyPair);
  console.log(config.keyStore);
  return newAccount;
}

async function existing_account_check_step(account: string, network: string) {
  const config = configFromNetwork(network);
  const near = await connect(config);
  const accountString = `${account}.${network}`;
  console.log(accountString);
  const accountInfo = await near.account(accountString);

  try {
    const state = await accountInfo.state();
    console.log(`Account ${account}.${network} exists`, state);
    return true;
  } catch (error: any) {
    if (
      error.type === 'UntypedError' &&
      error.message ==
        'TypedError: [-32000] Server error: The node does not track the shard ID 0'
    ) {
      console.log(error);
      return false;
    } else if (error.type === 'AccountDoesNotExist') {
      return false;
    } else {
      console.log(error);
      return false;
    }
  }
}

async function account_balance_step(account: string, network: string) {
  const config = configFromNetwork(network);
  const client = await connect(config);
  const balanceOf = await client.account(account);
  const balance = await balanceOf.getAccountBalance();
  return balance.total as string;
}

async function transfer_step(
  receiver: string,
  sender: string,
  network: string,
  rekey: string,
) {
  const config = configFromNetwork(network);
  const client = await connect(config);
  config.keyStore?.setKey('testnet', sender, KeyPair.fromString(rekey));
  const senderAccount = await client.account(sender);
  const balance = await senderAccount.getAccountBalance();
  console.log(balance);
  const txAmount = '1';
  console.log('Signing transaction with:', secret_key);
  const keycheck = await config.keyStore?.getKey('testnet', sender);
  console.log('Checking key:', keycheck);
  const yoctoAmount = parseNearAmount(txAmount) as string;
  const amount = new BN(yoctoAmount);
  console.log('Sending from:', senderAccount);
  return await senderAccount.sendMoney(receiver, amount);
}

/**
 * Test cases
 */

describe('NEAR backend tests', () => {
  // Avoid jest open handle error
  jest.setTimeout(30000);

  test('Connection step', async () => {
    await expect(connection_step('testnet')).resolves.toBeDefined();
  });

  test('Keypair step', async () => {
    await expect(keypair_step()).resolves.toBeDefined();
  });

  test('Nonexistent Account Name check step', async () => {
    await expect(
      nonexistent_account_check_step(fakename, 'testnet'),
    ).resolves.toBeTruthy();
  });

  test('Create Account step', async () => {
    await expect(
      create_account_step(fakename, 'testnet'),
    ).resolves.toBeTruthy();
  });

  test('Existing Account Name check step', async () => {
    await expect(
      existing_account_check_step('learn', 'testnet'),
    ).resolves.toBeTruthy();
  });

  test('Account Balance step', async () => {
    await expect(
      account_balance_step(fakename, 'testnet'),
    ).resolves.toBeDefined();
  });

  test('Transfer NEAR step', async () => {
    await expect(
      transfer_step('learn.testnet', fakename, 'testnet', secret_key),
    ).resolves.toBeDefined();
  });
});
