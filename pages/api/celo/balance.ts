import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-celo/lib';
import {newKit} from '@celo/contractkit';

type ResponseT = {
  attoCELO: string;
  attoUSD: string;
  attoEUR: string;
};
export default async function balance(
  req: NextApiRequest,
  res: NextApiResponse<ResponseT | string>,
) {
  try {
    const {address, network} = req.body;
    const url = getNodeUrl(network);
    const kit = newKit(url);

    const goldtoken = await kit.contracts.getGoldToken();
    const celoBalance = await goldtoken.balanceOf(address);

    const stabletokenUSD = await kit.contracts.getStableToken('cUSD');
    const cUSDBalance = await stabletokenUSD.balanceOf(address);

    const stabletokenEUR = await kit.contracts.getStableToken('cEUR');
    const cEURBalance = await stabletokenEUR.balanceOf(address);

    res.status(200).json({
      attoCELO: celoBalance.toString(),
      attoUSD: cUSDBalance.toString(),
      attoEUR: cEURBalance.toString(),
    });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
