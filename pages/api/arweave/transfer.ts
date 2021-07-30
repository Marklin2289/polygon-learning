import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'
import TestWeave from 'testweave-sdk'

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, wallet, amount } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        const key = JSON.parse(wallet)

        const testWeave = await TestWeave.init(arweave);
        const rootAddress = await arweave.wallets.getAddress(testWeave.rootJWK);
        
        const fundTransaction = await arweave.createTransaction({
            target: rootAddress,
            quantity: arweave.ar.arToWinston(amount)
        }, key);
        
        await arweave.transactions.sign(fundTransaction, key);
        await arweave.transactions.post(fundTransaction)
        
        await testWeave.mine()
        const statusAfterMine = await arweave.transactions.getStatus(
            fundTransaction.id
        )
        console.log(statusAfterMine)
        console.log(fundTransaction.id)

        res.status(200).json(fundTransaction.id)
    } catch (error) {
        console.error(error)
        res.status(500).json('transfer failed')
    }
}
