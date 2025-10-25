import { WalletManager } from './wallet-manager';
import { Web3WalletManager } from './web3-wallet-manager';

async function main() {
  // Example usage of both wallet managers
  const PROVIDER_URL = "http://localhost:8545";
  const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default
  
  console.log("=== Smart Contract Wallet Demo ===\n");

  try {
    // Using Ethers.js
    console.log("1. Using Ethers.js Wallet Manager");
    const ethersWallet = new WalletManager(PROVIDER_URL, PRIVATE_KEY);
    
    console.log("Deploying contract with Ethers...");
    const ethersAddress = await ethersWallet.deployContract();
    console.log(`Contract deployed at: ${ethersAddress}\n`);

    // Get initial state
    const owner = await ethersWallet.getOwner();
    const balance = await ethersWallet.getBalance();
    console.log(`Owner: ${owner}`);
    console.log(`Balance: ${ethersWallet.formatEther(balance)} ETH\n`);

    // Fund the wallet
    console.log("Funding wallet with 1 ETH...");
    await ethersWallet.fundWallet(ethersWallet.parseEther("1.0"));
    const newBalance = await ethersWallet.getBalance();
    console.log(`New Balance: ${ethersWallet.formatEther(newBalance)} ETH\n`);

    // Set a guardian
    const guardianAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account #1
    console.log(`Setting guardian: ${guardianAddress}`);
    await ethersWallet.setGuardian(guardianAddress, true);
    const isGuardian = await ethersWallet.isGuardian(guardianAddress);
    console.log(`Is guardian: ${isGuardian}\n`);

    // Set allowance
    const allowedUser = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Hardhat account #2
    console.log(`Setting allowance for ${allowedUser}: 0.5 ETH`);
    await ethersWallet.setAllowance(allowedUser, ethersWallet.parseEther("0.5"));
    const allowance = await ethersWallet.getAllowance(allowedUser);
    console.log(`Allowance: ${ethersWallet.formatEther(allowance.amount)} ETH, Allowed: ${allowance.isAllowed}\n`);

    // Using Web3.js
    console.log("2. Using Web3.js Wallet Manager");
    const web3Wallet = new Web3WalletManager(PROVIDER_URL, PRIVATE_KEY);
    
    // Connect to the same deployed contract
    await web3Wallet.connectToContract(ethersAddress);
    
    // Get state using Web3
    const web3Owner = await web3Wallet.getOwner();
    const web3Balance = await web3Wallet.getBalance();
    console.log(`Owner (Web3): ${web3Owner}`);
    console.log(`Balance (Web3): ${web3Wallet.fromWei(web3Balance)} ETH\n`);

    console.log("Demo completed successfully!");

  } catch (error) {
    console.error("Error in demo:", error);
  }
}

// Allow this script to be run directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };