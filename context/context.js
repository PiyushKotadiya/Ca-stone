import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import toast from "react-hot-toast";

// INTERNAL IMPORT
import {
  MUSIC_NFT_CONTRACT,
  MUSIC_ICO_CONTRACT,
  connectWallet,
  fetchMusicNFT,
  musicNFT_Address,
  OWNER_ADDRESS,
  VERIFY_AMOUNT,
  CREDIT_AMOUNT,
  REWARD_TOKEN,
  rewardLock,
} from "./constants";

export const MusicNFTContext = React.createContext();

export const MusicNFTProvider = ({ children }) => {
  const MUSIC_DAPP = "Music Dapp";
  const currency = "ETH"; // Change to ETH for Sepolia
  const network = "Sepolia"; // Update network name

  const [loader, setLoader] = useState(false);

  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
  const notifyError = (msg) => toast.error(msg, { duration: 2000 });

  //--- CREATENFT FUNCTION
  const createMusicNFT = async (title, fileURL, imageURL, description) => {
    if (!title || !fileURL || !imageURL || !description)
      return console.log("Data Is Missing");

    const data = JSON.stringify({ title, fileURL, imageURL, description });
    //
    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `87e02bbd561e5e787131`,
          pinata_secret_api_key: `8223ac86a76490a9e2578047762cc9c215e5313eeaca0fa693e5592ebd9eb7d1`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(url);

      const returnData = await createSale(url);
      return returnData;
    } catch (error) {
      console.log(error);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (url) => {
    try {
      const address = await connectWallet();
      const contract = await MUSIC_NFT_CONTRACT();

      const currentTokenId = await contract._tokenIds();

      const transaction = await contract.createToken(url);

      await transaction.wait();

      const details = {
        transaction,
        currentTokenId: currentTokenId.toNumber() + 1,
      };
      return details;
    } catch (error) {
      console.log(error);
    }
  };

  //--- ICO
  const musicICO = async () => {
    try {
      const address = await connectWallet();
      const contract = await MUSIC_ICO_CONTRACT();

      const tokenDetails = await contract.getTokenDetails();

      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      const signer = provider.getSigner();

      const ethBal = await signer.getBalance(); // Change to ETH balance

      const TOKEN_DETAILS = {
        tokenBal: ethers.utils.formatEther(tokenDetails.balance.toString()),
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        supply: ethers.utils.formatEther(tokenDetails.supply.toString()),
        tokenPrice: ethers.utils.formatEther(tokenDetails.tokenPrice.toString()),
        tokenAddr: tokenDetails.tokenAddr,
        ethBal: ethers.utils.formatEther(ethBal.toString()), // Change to ETH balance
        address: address.toLowerCase(),
      };

      return TOKEN_DETAILS;
    } catch (error) {
      console.log(error);
    }
  };

  // BUY TOKEN
  const buyToken = async (amount) => {
    try {
      setLoader(true);
      const address = await connectWallet();
      const contract = await MUSIC_ICO_CONTRACT();

      const tokenDetails = await contract.getTokenDetails();
      const availableToken = ethers.utils.formatEther(tokenDetails.balance.toString());

      if (availableToken > 1) {
        const price = ethers.utils.formatEther(tokenDetails.tokenPrice.toString()) * Number(amount);
        const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

        console.log(payAmount);

        const transaction = await contract.buyToken(Number(amount), {
          value: payAmount,
          gasLimit: ethers.utils.hexlify(8000000),
        });

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction successful");
        console.log(transaction);
      }
    } catch (error) {
      console.log(error);
      notifyError("Error, try again later");
      setLoader(false);
    }
  };

  // TRANSFER ETHER
  const transferEther = async (amount, _receiver) => {
    try {
      setLoader(true);
      const address = await connectWallet();
      const contract = await MUSIC_ICO_CONTRACT();

      const payAmount = ethers.utils.parseUnits(amount.toString(), "ether");

      const transaction = await contract.transferEther(_receiver, payAmount, {
        value: payAmount,
        gasLimit: ethers.utils.hexlify(8000000),
      });

      await transaction.wait();
      setLoader(false);
      notifySuccess("Transaction successful");
      console.log(transaction);
    } catch (error) {
      console.log(error);
      notifyError("Error, try again later");
      setLoader(false);
    }
  };

  // VERIFY_ACCOUNT
  const transferToOwnerAcc = async (VERIFY_AMOUNT) => {
    try {
      setLoader(true);
      const address = await connectWallet();
      const contract = await MUSIC_ICO_CONTRACT();

      const payAmount = ethers.utils.parseUnits(VERIFY_AMOUNT.toString(), "ether");

      const transaction = await contract.transferToOwner(payAmount, {
        value: payAmount,
        gasLimit: ethers.utils.hexlify(8000000),
      });

      await transaction.wait();

      console.log(transaction);
      return transaction;
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Try again later");
    }
  };

  // REWARD USER TOKEN
  const rewardToken = async (amount) => {
    try {
      setLoader(true);

      const address = await connectWallet();
      const contract = await MUSIC_ICO_CONTRACT();

      const tokenDetails = await contract.getTokenDetails();
      const availableToken = ethers.utils.formatEther(tokenDetails.balance.toString());

      if (availableToken > 1) {
        const transaction = await contract.tokenReward(Number(amount), {
          gasLimit: ethers.utils.hexlify(8000000),
        });

        await transaction.wait();
        console.log(transaction);

        return transaction;
      }
    } catch (error) {
      console.log(error);
      notifyError("Error, try again later");
      setLoader(false);
    }
  };

  return (
    <MusicNFTContext.Provider
      value={{
        createMusicNFT,
        fetchMusicNFT,
        musicICO,
        buyToken,
        transferEther,
        transferToOwnerAcc,
        rewardToken,
        rewardLock,
        REWARD_TOKEN,
        musicNFT_Address,
        currency,
        network,
        OWNER_ADDRESS,
        VERIFY_AMOUNT,
        CREDIT_AMOUNT,
        loader,
        setLoader,
      }}
    >
      {children}
    </MusicNFTContext.Provider>
  );
};
