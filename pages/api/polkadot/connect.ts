import type {NextApiRequest, NextApiResponse} from 'next';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {getNodeUrl} from '@figment-polkadot/lib';

export default async function connect(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  let provider: any;
  try {
    const {network} = req.body;
    const url = getNodeUrl(network);
    const provider = new WsProvider(url);
    const api = await ApiPromise.create({provider: provider});
    const rawVersion = await api.rpc.system.version();
    const version = rawVersion.toHuman();
    res.status(200).json(version);
  } catch (error) {
    if (provider) {
      await provider.disconnect();
    }
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
