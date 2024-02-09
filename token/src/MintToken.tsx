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

  return (
    <>
      <div>
        Mint Token Section
        <div>
          <button onClick={createToken}>Create Token</button>
          <button>Mint Token</button>
          <button>Check Balance</button>
          <button>Send Token</button>
        </div>
      </div>
    </>
  )
}


export default MintToken