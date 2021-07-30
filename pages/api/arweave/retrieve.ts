import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, dataId } = req.body.state
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        console.log(dataId)
        const data = await arweave.transactions.getData(dataId, {decode: true, string: true}) as string;
        console.log(data);
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json('retrieve data failed')
    }
}
