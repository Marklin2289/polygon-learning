import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'
import TestWeave from 'testweave-sdk'

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, wallet, data } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        // console.log(data)
        const key = JSON.parse(wallet)
        const testWeave = await TestWeave.init(arweave);

        // console.log(wallet)
        const dataTransaction = await arweave.createTransaction({ data: data }, key);
        dataTransaction.addTag('Content-Type', 'text/html');
        dataTransaction.addTag('topic', 'blockchain');

        await arweave.transactions.sign(dataTransaction, key);
        await arweave.transactions.post(dataTransaction)
        const statusAfterPost = await arweave.transactions.getStatus(
            dataTransaction.id
        )
        // console.log(statusAfterPost)

        await testWeave.mine()
        const statusAfterMine = await arweave.transactions.getStatus(
            dataTransaction.id
        )
        // console.log(statusAfterMine)
        if (statusAfterMine.status != 200) {
            throw new Error(JSON.stringify(statusAfterMine))
        }
        console.log(dataTransaction.id)

        res.status(200).json(dataTransaction.id)
    } catch (error) {
        console.error(error)
        const status = JSON.parse(error)
        res.status(500).json(`transfer failed with status: ${status}`)
    }
}
