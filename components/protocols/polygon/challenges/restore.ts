import {ethers} from 'ethers';

const restore = (privateKey: string, address?: string) => {
  try {
    const wallet = ethers.Wallet.fromMnemonic(privateKey.trim());
    if (wallet.address === address) {
      const restoredAddress = wallet.address;
      return {
        restoredAddress,
      };
    } else {
      return {error: 'Unable to restore account'};
    }
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    return {error: errorMessage};
  }
};

export default restore;
