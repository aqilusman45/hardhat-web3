import { FUNDME_ABI } from "./constants.js";
import { Contract, ethers } from "./ethers.esm.min.js";

const { ethereum } = window;
const isEthereumLoaded = typeof ethereum !== "undefined";

const FUNDME_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);

(async () => {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  connectButton.innerHTML = accounts.length ? "Connected" : "Connect";
})();

async function connect() {
  if (isEthereumLoaded) {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected";
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  if (isEthereumLoaded) {
    const amount = "1";
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const fundMe = new ethers.Contract(FUNDME_ADDRESS, FUNDME_ABI, signer);
    const transactionResponse = await fundMe.fund({
      value: ethers.utils.parseEther(amount),
    });
    const txReceipt = await transactionResponse.wait(1);
    console.log(txReceipt);
  }
}
