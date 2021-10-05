import {newKit} from '@celo/contractkit';
import HelloWorld from 'contracts/celo/HelloWorld.json';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve('.env.local')});

// Avoid jest open handle error
afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
});

enum CELO_NETWORKS {
  MAINNET = 'MAINNET',
  ALFAJORES = 'alfajores',
}

const getSafeUrl = (hub = true) =>
  hub
    ? getDataHubCeloNodeUrl(CELO_NETWORKS.ALFAJORES)
    : 'https://alfajores-forno.celo-testnet.org';

const getDataHubCeloNodeUrl = (network: CELO_NETWORKS): string =>
  network === CELO_NETWORKS.MAINNET
    ? `https://${process.env.DATAHUB_CELO_MAINNET_RPC_URL}/apikey/${process.env.DATAHUB_CELO_API_KEY}/`
    : `https://${process.env.DATAHUB_CELO_TESTNET_RPC_URL}/apikey/${process.env.DATAHUB_CELO_API_KEY}/`;

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

// Funded (sender) address and privateKey
const address = '0x4f73995d563b324B831ba7f595AD32FE1A508033';
const secret =
  '0x01b401e32ca5af9c06d3d9807eac20b018d99289cd40e9ff519f9f757f3b8ce8';
const OneCUSD = '1000000000000000000';
var contractAddress: any = undefined;
const newMessage = `${getRandomString(16).toLocaleLowerCase()}`;

async function connection_step() {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    return await kit.web3.eth.getNodeInfo();
  } catch (error) {
    console.log(error);
  }
}

async function create_account_step() {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    const account = kit.web3.eth.accounts.create();
    return account.address;
  } catch (error) {
    console.log(error);
  }
}

async function account_balance_step(address: string) {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    const goldToken = await kit.contracts.getGoldToken();
    const stableToken = await kit.contracts.getStableToken();
    const celoBalance = await goldToken.balanceOf(address);
    const cUSDBalance = await stableToken.balanceOf(address);
    console.log(
      `Balances of ${address}: CELO: ${celoBalance} cUSD: ${cUSDBalance}`,
    );
    return celoBalance;
  } catch (error) {
    console.log(error);
  }
}

async function transfer_step(recipient: string) {
  // Non-funded (recipient) address and privateKey
  // const recipient = '0x5B71cFd752481161ad8FE3F4d9C9d0364384Fc44'
  // 0x9aa99ec98a0d8473267e2cabab354719adecc47d457fefc1516f37fff8bdd48c
  const amount = '200000';
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    kit.connection.addAccount(secret);
    const celoToken = await kit.contracts.getGoldToken();
    const celotx = await celoToken
      .transfer(recipient, amount)
      .send({from: address});
    const celoReceipt = await celotx.waitReceipt();
    console.log(
      `Transfer: https://alfajores-blockscout.celo-testnet.org/tx/${celoReceipt.transactionHash}`,
    );
    return celoReceipt.transactionHash;
  } catch (error) {
    console.log(error);
  }
}

async function swap_tokens_step(address: string) {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    const stableToken = await kit.contracts.getStableToken();
    const exchange = await kit.contracts.getExchange();
    kit.connection.addAccount(secret);
    await stableToken
      .approve(exchange.address, OneCUSD)
      .sendAndWaitForReceipt({from: address, feeCurrency: stableToken.address});
    // Exchange cUSD for CELO
    const goldAmount = await exchange.quoteStableSell(OneCUSD);
    const sellReceipt = await exchange
      .sellStable(OneCUSD, goldAmount)
      .sendAndWaitForReceipt({
        from: address,
        feeCurrency: stableToken.address,
        gas: '500000',
      });
    console.log(
      `Swap: https://alfajores-blockscout.celo-testnet.org/tx/${sellReceipt.transactionHash}`,
    );
    return sellReceipt.transactionHash;
  } catch (error) {
    console.log(error);
  }
}

async function contract_step() {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    kit.connection.addAccount(secret);
    let tx = await kit.sendTransaction({
      from: address,
      data: HelloWorld.bytecode,
    });
    const receipt = await tx.waitReceipt();
    console.log(
      `Deployment: https://alfajores-blockscout.celo-testnet.org/tx/${receipt.transactionHash}`,
    );
    contractAddress = receipt.contractAddress;
    return receipt?.contractAddress as string;
  } catch (error) {
    console.log(error);
  }
}

async function get_storage_step(contract: string) {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    kit.connection.addAccount(secret);
    const instance = new kit.web3.eth.Contract(HelloWorld.abi, contractAddress);
    const name = await instance.methods.getName().call();
    return name as string;
  } catch (error) {
    console.log('Error in get storage:', error);
  }
}

async function set_storage_step(newMessage: string) {
  try {
    const url = getSafeUrl();
    const kit = newKit(url);
    kit.connection.addAccount(secret);
    const instance = new kit.web3.eth.Contract(HelloWorld.abi, contractAddress);
    const txObject = await instance.methods.setName(newMessage);
    let tx = await kit.sendTransactionObject(txObject, {
      from: address,
      gas: '500000',
    });
    return await tx.waitReceipt();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Test cases
 */

describe('Celo backend tests', () => {
  // Avoid jest open handle error
  jest.setTimeout(30000);

  test('Connection step', async () => {
    await expect(connection_step()).resolves.toBeDefined();
  });

  test('Create account step', async () => {
    await expect(create_account_step()).resolves.toBeDefined();
  });

  test('Account balance step', async () => {
    await expect(
      account_balance_step('0x4f73995d563b324B831ba7f595AD32FE1A508033'),
    ).resolves.toHaveProperty('c');
  });

  test('Transfer tokens step', async () => {
    await expect(
      transfer_step('0x5B71cFd752481161ad8FE3F4d9C9d0364384Fc44'),
    ).resolves.toBeDefined();
  });

  test('Swap tokens step', async () => {
    await expect(
      swap_tokens_step('0x4f73995d563b324B831ba7f595AD32FE1A508033'),
    ).resolves.toBeDefined();
  });

  test('Deploy contract step', async () => {
    await expect(contract_step()).resolves.toBeDefined();
  });

  test('Get contract storage step', async () => {
    console.log(
      `Deployed contract: https://alfajores-blockscout.celo-testnet.org/address/${contractAddress}`,
    );
    await expect(get_storage_step(contractAddress)).resolves.toBeDefined();
  });

  test('Set contract storage step', async () => {
    await expect(set_storage_step(newMessage)).resolves.toHaveProperty(
      'transactionHash',
    );
  });
});
