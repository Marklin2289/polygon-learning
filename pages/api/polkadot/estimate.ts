import type {NextApiRequest, NextApiResponse} from 'next';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {getNodeUrl} from '@figment-polkadot/lib';

export default async function estimate(
  req: NextApiRequest,
  res: NextApiResponse<number | string>,
) {
  let provider;
  try {
    const {address, network} = req.body;
    const url = getNodeUrl(network);
    provider = new WsProvider(url);
    const api = await ApiPromise.create({provider: provider});

    // A generic address for recipient (//Alice) and an amount to send
    const recipient = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const transferAmount = '1000000000'; // 1 milli WND

    // Transfer tokens
    const transfer = api.tx.balances.transfer(recipient, transferAmount);
    const info = await transfer.paymentInfo(address);
    const fees = info.partialFee.toNumber();

    res.status(200).json(fees);
  } catch (error) {
    if (provider) {
      await provider.disconnect();
    }
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
