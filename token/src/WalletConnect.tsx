import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
interface Props {
  children: React.ReactNode
}
const WalletConnect = ({ children }: Props): React.ReactNode => {
  const solNetwork = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    [solNetwork]
  );
  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <WalletModalProvider>
            <WalletMultiButton />
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}





export default WalletConnect;