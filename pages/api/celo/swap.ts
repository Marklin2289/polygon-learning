import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-celo/lib';
import {newKit} from '@celo/contractkit';

type ResponseT = {
  celo: string;
  hash: string;
};
export default async function swap(
  req: NextApiRequest,
  res: NextApiResponse<ResponseT | string>,
) {
  try {
    const {secret, address, network} = req.body;
    const OneCUSD = '1000000000000000000';

    const url = getNodeUrl(network);
    const kit = newKit(url);
    kit.addAccount(secret);

    // Get contract wrappers
    // - StableTokenWrapper
    // - ExchangeWrapper
    const stableToken = await kit.contracts.getStableToken();
    const exchange = await kit.contracts.getExchange();

    await stableToken
      .approve(exchange.address, OneCUSD)
      .send({from: address, feeCurrency: stableToken.address})
      .then((receipt) => receipt.waitReceipt());
    // Exchange cUSD for CELO
    const goldAmount = await exchange.quoteStableSell(OneCUSD);
    const sellReceipt = await exchange
      .sellStable(OneCUSD, goldAmount)
      .send({from: address, feeCurrency: stableToken.address});
    await sellReceipt.waitReceipt();
    const hash = await sellReceipt.getHash();
    res.status(200).json({
      celo: goldAmount.toString(),
      hash,
    });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
