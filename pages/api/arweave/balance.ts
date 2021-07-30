import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, address } = req.body
        const arweave = Arweave.init({
        host,
        port,
        protocol,
        })
        const balance = await arweave.wallets.getBalance(address)
        console.log(balance)
        res.status(200).json(balance)
    } catch (error) {
        console.error(error)
        res.status(500).json('balance failed')
    }
}
