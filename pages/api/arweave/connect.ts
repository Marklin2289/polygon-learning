import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'

// patch type missmatch
export interface NetworkI {
    network: string
    version: number
    release: number
    height: number
    current: string
    blocks: number
    peers: number
    queue_length: number
    node_state_latency: number
}

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        const info = (await arweave.network.getInfo()) as unknown as NetworkI
        console.log(info)
        res.status(200).json(info.network)
    } catch (error) {
        console.error(error)
        res.status(500).json('Unable to connect to the network')
    }
}
