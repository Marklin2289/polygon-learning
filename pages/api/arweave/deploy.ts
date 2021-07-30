import type { NextApiRequest, NextApiResponse } from 'next'
import Arweave from 'arweave'
import TestWeave from 'testweave-sdk'
import initialState from 'contracts/arweave/token-pst-contract.json'
import { readFileSync } from 'fs'
import { join } from 'path'

const deployContract = async (arweave: Arweave, wallet: string) => {
    // const contractPath = join(process.cwd(), 'contracts/arweave/token-pst-contract.js ');
    // console.log(contractPath)
    const contractSource = readFileSync('./contracts/arweave/token-pst-contract.js', 'utf-8').toString();
    const testWeave = await TestWeave.init(arweave);

    const transaction = await arweave.createTransaction({ data: contractSource }, JSON.parse(wallet));
    transaction.addTag('App-Name', 'SmartWeaveContractSource');
    transaction.addTag('App-Version', '0.3.0');
    transaction.addTag('Content-Type', 'application/javascript');

    await arweave.transactions.sign(transaction, JSON.parse(wallet));
    const txId = transaction.id;

    await arweave.transactions.post(transaction);    
    await testWeave.mine()
    const statusAfterMine = await arweave.transactions.getStatus(txId)
    console.log(statusAfterMine)
    if (statusAfterMine.status != 200) {
        throw new Error(JSON.stringify(statusAfterMine))
    }
    return txId
}

const deployInitialState = async (arweave: Arweave, wallet: string, contractSourceTxId: string) => {
    const testWeave = await TestWeave.init(arweave);

    const transaction = await arweave.createTransaction({ data: JSON.stringify(initialState) }, JSON.parse(wallet));
    transaction.addTag('App-Name', 'SmartWeaveContract');
    transaction.addTag('App-Version', '0.3.0');
    transaction.addTag('Contract-Src', contractSourceTxId);
    transaction.addTag('Content-Type', 'application/json');

    await arweave.transactions.sign(transaction, JSON.parse(wallet));
    const txId = transaction.id;

    await arweave.transactions.post(transaction);    
    await testWeave.mine()
    const statusAfterMine = await arweave.transactions.getStatus(txId)
    console.log(statusAfterMine)
    if (statusAfterMine.status != 200) {
        throw new Error(JSON.stringify(statusAfterMine))
    }
    return txId
}

export default async function(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const { host, port, protocol, wallet } = req.body
        const arweave = Arweave.init({
            host,
            port,
            protocol,
        })
        const contractSourceTxId = await deployContract(arweave, wallet);
        const initialStateTxId = await deployInitialState(arweave, wallet, contractSourceTxId);

        console.log(contractSourceTxId, initialStateTxId)

        res.status(200).json(initialStateTxId)
    } catch (error) {
        console.error(error)
        const status = JSON.parse(error)
        res.status(500).json(`transfer failed with status: ${status}`)
    }
}
