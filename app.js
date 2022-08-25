import { FUNDME_ABI } from "./constants.js";
import { Contract, ethers } from "./ethers.esm.min.js";

const { ethereum } = window;
const isEthereumLoaded = typeof ethereum !== "undefined";

const FUNDME_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalance = document.getElementById("getBalance");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
getBalance.addEventListener("click", getContractBalance);
withdrawButton.addEventListener("click", withdraw);

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

async function withdraw() {
  if (isEthereumLoaded) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const fundMe = new ethers.Contract(FUNDME_ADDRESS, FUNDME_ABI, signer);
    const transactionResponse = await fundMe.withdraw();
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done");
  }
}
async function getContractBalance() {
  if (isEthereumLoaded) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const res = await provider.getBalance(FUNDME_ADDRESS);
    console.log(ethers.utils.formatEther(res));
  }
}

async function fund() {
  if (isEthereumLoaded) {
    const ethAmount = document.getElementById("ethAmount").value;
    if (!ethAmount) {
      alert("Cannot be empty!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const fundMe = new ethers.Contract(FUNDME_ADDRESS, FUNDME_ABI, signer);
    const transactionResponse = await fundMe.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((res, rej) => {
    provider.once(transactionResponse.hash, (txReceipt) => {
      console.log("Transaction completed", txReceipt.confirmations);
      res();
    });
  });
}
