import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-celo/lib';
import {newKit} from '@celo/contractkit';
import HelloWorld from 'contracts/celo/HelloWorld.json';

export default async function connect(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    const {contract, network} = req.body;
    const url = getNodeUrl(network);
    const kit = newKit(url);

    const instance = new kit.web3.eth.Contract(HelloWorld.abi, contract);
    const name = await instance.methods.getName().call();

    res.status(200).json(name);
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
