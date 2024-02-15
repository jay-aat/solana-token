import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  Account,
  createSetAuthorityInstruction,
  AuthorityType
} from "@solana/spl-token";


function MintNFT() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Since we are doing this on the devnet, we don't have to connect to a wallet.
  // We can just generate a new wallet every time.
  const fromWallet = Keypair.generate();
  console.log(`Wallet Account: ${fromWallet.publicKey.toBase58()}`);

  let mint: PublicKey;
  let fromTokenAccount: Account;

  async function createNFT() {
    // We need some sols for our operations.
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    // Create new NFT mint.
    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      0 // Only allow whole tokens.
    );
    console.log(`Create NFT: ${mint.toBase58()}`);

    // Get the account that minted the NFT, else create the associated account.
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(`Create NFT Account: ${fromTokenAccount.address.toBase58()}`);
  }

  async function mintNFT() {
    const signature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      1
    );
    console.log(`Mint Signature: ${signature}`);
  }

  async function lockNFT() {
    // Create our transaction to change minting permissions.
    let transaction = new Transaction().add(createSetAuthorityInstruction(
      mint,
      fromWallet.publicKey,
      AuthorityType.MintTokens,
      null
    ));

    // Send transaction.
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
    console.log(`Lock Signature: ${signature}`);
  }

  return (
    <>
      <div>
        Mint Token Section
        <div>
          <button onClick={createNFT}>Create NFT</button>
          <button onClick={mintNFT}>Mint NFT</button>
          <button onClick={lockNFT}>Lock NFT</button>
        </div>
      </div>
    </>
  )
}


export default MintNFT