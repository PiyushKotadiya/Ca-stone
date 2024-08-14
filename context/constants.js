import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";

import musicICO from "./MusicICO.json";
import musicNFT from "./MusicNFT.json";
import theBlockchainCoders from "./TheBlockchainCoders.json";

// OWNER ADDRESS
export const OWNER_ADDRESS = "0x8FcC591d31b639C4dD76876600BE452E4f46c798";
export const VERIFY_AMOUNT = 0.00005;
export const CREDIT_AMOUNT = 0.00005;
// export const REWARD_TOKEN = 5;
// export const rewardLock = 5;

// TOKEN ThebBlockchainCoders
export const thebBlockchainCoders_Add =
  "0xE59E1aaECd1292Bab2094dAcc8c447be05e51bF0";
const theBlockchainCoders_ABI = theBlockchainCoders.abi;

// ICO CONTRACT
const musicICO_Address = "0xE5FB25E41E813202DAf0312F9f61894442562B89";
const musicICO_ABI = musicICO.abi;

// MUSIC NFT CONTRACT
// export const musicNFT_Address = "0x8DbBf07C0e6CddA396e6e9bEfab6c81F7bC7822D";
export const musicNFT_Address = "0xB843A4797e9968A6De17dc7Ec1C33d19F94191A0";
const musicNFT_ABI = musicNFT.abi;

// NETWORK CONFIGURATION FOR SEPOLIA
const networks = {
  sepolia: {
    chainId: `0x${Number(11155111).toString(16)}`, // Sepolia's chainId
    chainName: "Sepolia",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
};

// CHANGE NETWORK TO SEPOLIA
const changeNetwork = async () => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        networks.sepolia,
      ],
    });
  } catch (err) {
    console.log(err.message);
  }
};

const handleNetworkSwitch = async () => {
  await changeNetwork();
};

// CONNECT WALLET
export const connectWallet = async () => {
  try {
    if (!ethereum) return alert("Please install MetaMask.");
    await handleNetworkSwitch();
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    console.log(error);
    throw new Error("No ethereum object");
  }
};

// FETCH SMART CONTRACT
const fetchContract = (address, abi, signer) =>
  new ethers.Contract(address, abi, signer);

// MUSIC NFT CONTRACT
export const MUSIC_NFT_CONTRACT = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(musicNFT_Address, musicNFT_ABI, signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
  }
};

// MUSIC ICO CONTRACT
export const MUSIC_ICO_CONTRACT = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(musicICO_Address, musicICO_ABI, signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
  }
};

// FETCH MUSIC NFT DETAILS
export const fetchMusicNFT = async (_tokenId) => {
  try {
    await connectWallet();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = fetchContract(musicNFT_Address, musicNFT_ABI, signer);

    const musicData = await contract.getMusicNFTDetails(_tokenId);
    const tokenURI = await contract.tokenURI(_tokenId);

    console.log(tokenURI);

    const musicInfo = await axios.get(tokenURI, {});

    const musicNFT = {
      title: musicInfo.data.title,
      fileURL: musicInfo.data.fileURL,
      imageURL: musicInfo.data.imageURL,
      description: musicInfo.data.description,
      owner: musicData.owner,
      seller: musicData.seller,
      tokenId: _tokenId,
    };

    console.log(musicNFT);
    return musicNFT;
  } catch (error) {
    console.log(error);
  }
};
