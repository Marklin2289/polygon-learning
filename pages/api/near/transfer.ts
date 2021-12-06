import type {NextApiRequest, NextApiResponse} from 'next';
import {configFromNetwork} from '@figment-near/lib';
import {connect, KeyPair} from 'near-api-js';
import {parseNearAmount} from 'near-api-js/lib/utils/format';
import BN from 'bn.js';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const {txSender, txAmount, txReceiver, network, secret} = req.body;

  try {
    const config = configFromNetwork(network);
    const keypair = KeyPair.fromString(secret);
    config.keyStore?.setKey('testnet', txSender, keypair);

    const yoctoAmount = parseNearAmount(txAmount) as string;
    const amount = new BN(yoctoAmount);

    const near = await connect(config);
    const account = await near.account(txSender);
    const transaction = await account.sendMoney(txReceiver, amount);
    return res.status(200).json(transaction.transaction.hash);
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    return res.status(500).json(errorMessage);
  }
}
