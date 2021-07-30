import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'
import TestWeave from 'testweave-sdk'

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<boolean>
) {
    try {
        const { host, port, protocol, address } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })

        const quantity = arweave.ar.arToWinston('75')
        const testWeave = await TestWeave.init(arweave)
        await testWeave.drop(address, quantity)

        res.status(200).json(true)
    } catch (error) {
        console.error(error)
        res.status(500).json(false)
    }
}
