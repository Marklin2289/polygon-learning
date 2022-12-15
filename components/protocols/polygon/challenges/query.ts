import {ethers} from 'ethers';

declare let window: {
  ethereum: ethers.providers.ExternalProvider;
};

const query = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const networkName = await provider.getNetwork().then((res) => {
      return res.name;
    });
    // const networkProvider = await provider.getNetwork();
    // const networkName = networkProvider.name;

    // TODO: Define the variables below
    // const chainId = await provider.getNetwork().then((res) => {
    //   return res.chainId;
    // });
    const chainId = provider.network.chainId;

    const blockHeight = await provider.getBlockNumber();
    // const gasPriceAsGwei = ethers.utils.formatUnits(
    //   await provider.getGasPrice(),
    //   'gwei',
    // );
    const gasPriceAsGwei = await provider.getGasPrice().then((res) => {
      return ethers.utils.formatUnits(res, 'gwei');
    });

    const blockInfo = await provider.getBlockWithTransactions(blockHeight);

    if (!chainId || !blockHeight || !gasPriceAsGwei || !blockInfo) {
      throw new Error('Please complete the code');
    }

    return {
      data: {
        networkName,
        chainId,
        blockHeight,
        gasPriceAsGwei,
        blockInfo,
      },
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export default query;
