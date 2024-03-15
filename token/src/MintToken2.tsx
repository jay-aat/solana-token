import {
  Connection,
  PublicKey,
  Keypair,
  TransactionInstruction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SignerWalletAdapterProps, WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  mint: Keypair | null,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) => {
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;
  if (mint != null) { transaction.sign(mint); }
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature
  });
  return signature;
};

function MintToken2() {
  const { connection } = useConnection();
  const wallet = useWallet();
  console.log(`Wallet Account: ${wallet.publicKey?.toBase58()}`);

  let mint: Keypair;

  const mintPubKey: string = "";

  async function createToken() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      mint = Keypair.generate();
      console.log(`New mint account public key: ${mint.publicKey?.toBase58()}`);

      const transactionInstructions: TransactionInstruction[] = [];

      transactionInstructions.push(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(connection),
          programId: TOKEN_PROGRAM_ID,
        })
      );

      transactionInstructions.push(
        createInitializeMintInstruction(
          mint.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey
        )
      );

      const associatedAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      console.log(`associatedAccount address: ${associatedAccount?.toBase58()}`);

      transactionInstructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedAccount,
          wallet.publicKey,
          mint.publicKey
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        mint,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function mintToken() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      const mintingTokenPubKey = mintPubKey == "" ? mint.publicKey : new PublicKey(mintPubKey);
      console.log(`Mint public key: ${mintingTokenPubKey.toBase58()}`);

      const associatedAccount = await getAssociatedTokenAddress(mintingTokenPubKey, wallet.publicKey);
      console.log(`associatedAccount address: ${associatedAccount?.toBase58()}`);

      const transactionInstructions: TransactionInstruction[] = [];

      transactionInstructions.push(
        createMintToCheckedInstruction(
          mintingTokenPubKey,
          associatedAccount,
          wallet.publicKey,
          200000000e9,
          9
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        null,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function checkBalance() {

  }

  async function sendToken() {

  }

  async function setTokenMetadata() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      const mintingTokenPubKey = mintPubKey == "" ? mint.publicKey : new PublicKey(mintPubKey);
      console.log(`Mint public key: ${mintingTokenPubKey.toBase58()}`);

      const token_metadata_program_id = new PublicKey(TOKEN_METADATA_PROGRAM_ID);

      const metadata_seeds = [
        Buffer.from('metadata'),
        token_metadata_program_id.toBuffer(),
        mintingTokenPubKey.toBuffer(),
      ];
      const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(metadata_seeds, token_metadata_program_id);

      const transactionInstructions: TransactionInstruction[] = [];

      transactionInstructions.push(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadata_pda,
            mint: mintingTokenPubKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            updateAuthority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          {
            createMetadataAccountArgsV3:
            {
              data: {
                name: "Uncle Ringo",
                symbol: "RINGO",
                uri: "https://raw.githubusercontent.com/jay-aat/solana-token/main/token/public/token_metadata_uncle_ringo.json",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
              },
              isMutable: true,
              collectionDetails: null
            }
          }
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        null,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function updateTokenMetadata() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      const mintingTokenPubKey = mintPubKey == "" ? mint.publicKey : new PublicKey(mintPubKey);
      console.log(`Mint public key: ${mintingTokenPubKey.toBase58()}`);

      const token_metadata_program_id = new PublicKey(TOKEN_METADATA_PROGRAM_ID);

      const [metadata_key] = await PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        token_metadata_program_id.toBuffer(),
        mintingTokenPubKey.toBuffer(),
      ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const transactionInstructions: TransactionInstruction[] = [];

      transactionInstructions.push(
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: metadata_key,
            updateAuthority: wallet.publicKey,
          },
          {
            updateMetadataAccountArgsV2:
            {
              data: {
                name: "XXX",
                symbol: "X3",
                uri: "",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
              },
              updateAuthority: wallet.publicKey,
              primarySaleHappened: true,
              isMutable: true,
            }
          }
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        null,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div>
        Mint Token Section
        <div>
          <button onClick={createToken}>Create Token</button>
          <button onClick={mintToken}>Mint Token</button>
          {/* <button onClick={checkBalance}>Check Balance</button>
          <button onClick={sendToken}>Send Token</button> */}
          <button onClick={setTokenMetadata}>Set Token Metadata</button>
          <button onClick={updateTokenMetadata}>Update Token Metadata</button>
        </div>
      </div>
    </>
  )
}

export default MintToken2;