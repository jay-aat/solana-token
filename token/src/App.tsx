import "./App.css";
import WalletConnect from "./WalletConnect";
import WalletInfo from "./WalletInfo";
import MintToken from "./MintToken";
import MintNFT from "./MintNFT";
import MintToken2 from "./MintToken2";


function App() {
  return (
    <>
      <WalletConnect>
        <WalletInfo />
        <MintToken />
        <MintNFT />
        <MintToken2 />
      </WalletConnect>
    </>
  )
}


export default App