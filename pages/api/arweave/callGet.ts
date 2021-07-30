import type { NextApiRequest, NextApiResponse } from 'next'
import { readContract } from 'smartweave';
import Arweave from 'arweave';


export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, stateId } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        const latestState = await readContract(arweave, stateId);
        console.log(latestState);

        res.status(200).json(latestState)
    } catch (error) {
        console.error(error)
        res.status(500).json('Call Get failed')
    }
}
