import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-secret/lib';
import {CosmWasmClient} from 'secretjs';

export default async function connect(
  req: NextApiRequest,
  res: NextApiResponse<string | string>,
) {
  try {
    const url = getNodeUrl();
    const {address} = req.body;
    const client = new CosmWasmClient(url);

    const account = await client.getAccount(address);
    const balance = account?.balance[0].amount as string;

    res.status(200).json(balance);
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
