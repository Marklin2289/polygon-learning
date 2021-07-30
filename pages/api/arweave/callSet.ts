import type { NextApiRequest, NextApiResponse } from 'next'
import { interactWrite, readContract } from 'smartweave';
import TestWeave from 'testweave-sdk'
import Arweave from 'arweave';


export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, wallet, stateId } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        const testWeave = await TestWeave.init(arweave);

        const generatedAddr = await arweave.wallets.getAddress(JSON.parse(wallet))
        console.log(generatedAddr)
        // interact with the contract
        const iwt = await interactWrite(arweave, testWeave.rootJWK, stateId, {
        function: 'transfer',
        target: generatedAddr,
        qty:5000
        }, [] , generatedAddr, '23999392')
        console.log(`Interact write transaction: ${JSON.stringify(iwt)}`);

        // mine the contract interaction transaction
        await testWeave.mine();
        console.log(iwt);
        const generatedAddressBalance = await arweave.wallets.getBalance(generatedAddr)
        console.log(generatedAddressBalance)

        const afterTransaction = await readContract(arweave, stateId);
        console.log(`After interact write: ${JSON.stringify(afterTransaction)}`);
        res.status(200).json(iwt)
    } catch (error) {
        console.error(error)
        res.status(500).json('call Set failed')
    }
}
