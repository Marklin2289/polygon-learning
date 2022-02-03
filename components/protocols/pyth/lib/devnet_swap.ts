import {readFile} from 'mz/fs';
import {Connection, Keypair} from '@solana/web3.js';
import {getOrca, OrcaFarmConfig, OrcaPoolConfig} from '@orca-so/sdk';
import Decimal from 'decimal.js';

const orka = async () => {
  /*** Setup ***/
  // 1. Read secret key file to get owner keypair
  const owner = Keypair.fromSecretKey(
    new Uint8Array([
      175, 193, 241, 226, 223, 32, 155, 13, 1, 120, 157, 36, 15, 39, 141, 146,
      197, 180, 138, 112, 167, 209, 70, 94, 103, 202, 166, 62, 81, 18, 143, 49,
      125, 253, 127, 53, 71, 38, 254, 214, 30, 170, 71, 69, 80, 46, 52, 76, 101,
      246, 34, 16, 96, 4, 164, 39, 220, 88, 184, 201, 138, 180, 181, 238,
    ]),
  );

  // 2. Initialzie Orca object with mainnet connection
  const connection = new Connection(
    'https://api.devnet.solana.com',
    'singleGossip',
  );
  const orca = getOrca(connection);

  try {
    /*** Swap ***/
    // 3. We will be swapping 0.1 SOL for some ORCA
    const orcaSolPool = orca.getPool(OrcaPoolConfig.ORCA_SOL);
    const solToken = orcaSolPool.getTokenB();
    const solAmount = new Decimal(0.1);
    const quote = await orcaSolPool.getQuote(solToken, solAmount);
    const orcaAmount = quote.getMinOutputAmount();

    console.log(
      `Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} ORCA`,
    );
    const swapPayload = await orcaSolPool.swap(
      owner,
      solToken,
      solAmount,
      orcaAmount,
    );
    const swapTxId = await swapPayload.execute();
    console.log('Swapped:', swapTxId, '\n');

    /*** Pool Deposit ***/
    // 4. Deposit SOL and ORCA for LP token
    const {maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut} =
      await orcaSolPool.getDepositQuote(orcaAmount, solAmount);

    console.log(
      `Deposit at most ${maxTokenBIn.toNumber()} SOL and ${maxTokenAIn.toNumber()} ORCA, for at least ${minPoolTokenAmountOut.toNumber()} LP tokens`,
    );
    const poolDepositPayload = await orcaSolPool.deposit(
      owner,
      maxTokenAIn,
      maxTokenBIn,
      minPoolTokenAmountOut,
    );
    const poolDepositTxId = await poolDepositPayload.execute();
    console.log('Pool deposited:', poolDepositTxId, '\n');

    /*** Farm Deposit ***/
    // 5. Deposit some ORCA_SOL LP token for farm token
    const lpBalance = await orcaSolPool.getLPBalance(owner.publicKey);
    const orcaSolFarm = orca.getFarm(OrcaFarmConfig.ORCA_SOL_AQ);
    const farmDepositPayload = await orcaSolFarm.deposit(owner, lpBalance);
    const farmDepositTxId = await farmDepositPayload.execute();
    console.log('Farm deposited:', farmDepositTxId, '\n');
    // Note 1: for double dip, repeat step 5 but with the double dip farm
    // Note 2: to harvest reward, orcaSolFarm.harvest(owner)
    // Note 3: to get harvestable reward amount, orcaSolFarm.getHarvestableAmount(owner.publicKey)

    /*** Farm Withdraw ***/
    // 6. Withdraw ORCA_SOL LP token, in exchange for farm token
    const farmBalance = await orcaSolFarm.getFarmBalance(owner.publicKey); // withdraw the entire balance
    const farmWithdrawPayload = await orcaSolFarm.withdraw(owner, farmBalance);
    const farmWithdrawTxId = await farmWithdrawPayload.execute();
    console.log('Farm withdrawn:', farmWithdrawTxId, '\n');

    /*** Pool Withdraw ***/
    // 6. Withdraw SOL and ORCA, in exchange for ORCA_SOL LP token
    const withdrawTokenAmount = await orcaSolPool.getLPBalance(owner.publicKey);
    const withdrawTokenMint = orcaSolPool.getPoolTokenMint();
    const {maxPoolTokenAmountIn, minTokenAOut, minTokenBOut} =
      await orcaSolPool.getWithdrawQuote(
        withdrawTokenAmount,
        withdrawTokenMint,
      );

    console.log(
      `Withdraw at most ${maxPoolTokenAmountIn.toNumber()} ORCA_SOL LP token for at least ${minTokenAOut.toNumber()} ORCA and ${minTokenBOut.toNumber()} SOL`,
    );
    const poolWithdrawPayload = await orcaSolPool.withdraw(
      owner,
      maxPoolTokenAmountIn,
      minTokenAOut,
      minTokenBOut,
    );
    const poolWithdrawTxId = await poolWithdrawPayload.execute();
    console.log('Pool withdrawn:', poolWithdrawTxId, '\n');
  } catch (err) {
    console.warn(err);
  }
};

export default orka;
