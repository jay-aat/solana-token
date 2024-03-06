import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
const WalletInfo = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  async function getBalance() {
    if (!publicKey) throw new WalletNotConnectedError();
    console.log(publicKey.toBase58());
    const balance = await connection.getBalance(publicKey);
    console.log(balance / LAMPORTS_PER_SOL);
  }
  return (
    <>
      <div>
        Wallet Section
        <div>
          <button onClick={getBalance}>Get Balance</button>
        </div>
      </div>
    </>
  )
}
export default WalletInfo;