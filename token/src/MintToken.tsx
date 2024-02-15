import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount
} from "@solana/spl-token";


function MintToken() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Since we are doing this on the devnet, we don't have to connect to a wallet.
  // We can just generate a new wallet every time.
  const fromWallet = Keypair.generate();
  console.log(`Wallet Account: ${fromWallet.publicKey.toBase58()}`);

  let mint: PublicKey;
  let fromTokenAccount: Account;

  const toWallet = new PublicKey("2VeLziagu5mqx4JpVD9UAoTcir5xLYJyd5U5QgwCnVH1");

  async function createToken() {
    // We need some sols for our operations.
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    // Create new token mint.
    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9 // (decimal) smallest number value of out token.
    );
    console.log(`Create token: ${mint.toBase58()}`);

    // Get the account that minted the token, else create the associated account.
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
  }

  async function mintToken() {
    const signature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      10000000000 // 10 billion = 10 tokens because of the 9 decimal.
    );
    console.log(`Mint Signature: ${signature}`);
  }

  async function checkBalance() {
    // Check the supply of tokens we have minted into existance.
    const mintInfo = await getMint(connection, mint);
    console.log(mintInfo.supply);

    // Get the amount of tokens left in the account.
    const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
    console.log(tokenAccountInfo.amount);
  }

  async function sendToken() {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);
    console.log(`toTokenAccount: ${toTokenAccount.address}`);

    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      1000000000 // 1 billion.
    );
    console.log(`Finished transfer with: ${signature}`);
  }

  return (
    <>
      <div>
        Mint Token Section
        <div>
          <button onClick={createToken}>Create Token</button>
          <button onClick={mintToken}>Mint Token</button>
          <button onClick={checkBalance}>Check Balance</button>
          <button onClick={sendToken}>Send Token</button>
        </div>
      </div>
    </>
  )
}


export default MintToken