import {CHAINS, PYTH_NETWORKS, PYTH_PROTOCOLS} from 'types';
import {getNodeURL as getNodeUrl} from 'utils/datahub';

// Helper for generating an account URL on Solana Explorer
export const accountExplorer = (network: string) => (address: string) => {
  if (network === PYTH_NETWORKS.LOCALNET) {
    return `https://explorer.solana.com/address/${address}?cluster=custom&customUrl=http://127.0.0.1:8899`;
  } else {
    return `https://explorer.solana.com/address/${address}?cluster=devnet`;
  }
};

// Helper for generating an transaction URL on Solana Explorer
export const transactionExplorer = (network: string) => (hash: string) => {
  if (network === PYTH_NETWORKS.LOCALNET) {
    return `https://explorer.solana.com/tx/${hash}?cluster=custom&customUrl=http://127.0.0.1:8899`;
  } else {
    return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
  }
};

// Helper for showing Pyth market data on pyth.network
export const pythMarketExplorer = (network: string, product: string) => {
  return `https://pyth.network/markets/?cluster=${network}#${product}`;
};

export const getNodeURL = (network?: string) =>
  getNodeUrl(CHAINS.PYTH, PYTH_NETWORKS.DEVNET, PYTH_PROTOCOLS.RPC, network);
