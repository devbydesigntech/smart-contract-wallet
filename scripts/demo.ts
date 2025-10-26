const { WalletManager } = require('./wallet-manager');
const { Web3WalletManager } = require('./web3-wallet-manager');

// Helper to add delays between transactions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  // Example usage of both wallet managers
  const PROVIDER_URL = "http://localhost:8545";
  const PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Hardhat account #1
  
  console.log("=== Smart Contract Wallet Demo ===\n");

  try {
    // Using Ethers.js
    console.log("1. Using Ethers.js Wallet Manager");
    const ethersWallet = new WalletManager(PROVIDER_URL, PRIVATE_KEY);
    
    console.log("Deploying contract with Ethers...");
    const ethersAddress = await ethersWallet.deployContract();
    console.log(`✓ Contract deployed at: ${ethersAddress}\n`);

    // Wait after deployment
    await delay(500);

    // Get initial state
    const owner = await ethersWallet.getOwner();
    const balance = await ethersWallet.getBalance();
    console.log(`✓ Owner: ${owner}`);
    console.log(`✓ Balance: ${ethersWallet.formatEther(balance)} ETH\n`);

    // Fund the wallet
    console.log("Funding wallet with 1 ETH...");
    const fundTx = await ethersWallet.fundWallet(ethersWallet.parseEther("1.0"));
    await fundTx.wait();
    await delay(500); // Wait for state to update
    
    const newBalance = await ethersWallet.getBalance();
    console.log(`✓ Funded! New Balance: ${ethersWallet.formatEther(newBalance)} ETH\n`);

    // Set a guardian
    const guardianAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Hardhat account #2
    console.log(`Setting guardian: ${guardianAddress}...`);
    const guardianTx = await ethersWallet.setGuardian(guardianAddress, true);
    await guardianTx.wait();
    await delay(500); // Wait for state to update
    
    const isGuardian = await ethersWallet.isGuardian(guardianAddress);
    console.log(`✓ Guardian set! Is guardian: ${isGuardian}\n`);

    // Set allowance
    const allowedUser = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Hardhat account #3
    console.log(`Setting allowance for ${allowedUser}: 0.5 ETH...`);
    const allowanceTx = await ethersWallet.setAllowance(allowedUser, ethersWallet.parseEther("0.5"));
    await allowanceTx.wait();
    await delay(500); // Wait for state to update
    
    const allowance = await ethersWallet.getAllowance(allowedUser);
    console.log(`✓ Allowance set! Amount: ${ethersWallet.formatEther(allowance.amount)} ETH, Allowed: ${allowance.isAllowed}\n`);

    // Using Web3.js
    console.log("2. Using Web3.js Wallet Manager");
    const web3Wallet = new Web3WalletManager(PROVIDER_URL, PRIVATE_KEY);
    
    // Connect to the same deployed contract
    await web3Wallet.connectToContract(ethersAddress);
    
    // Get state using Web3
    const web3Owner = await web3Wallet.getOwner();
    const web3Balance = await web3Wallet.getBalance();
    console.log(`✓ Owner (Web3): ${web3Owner}`);
    console.log(`✓ Balance (Web3): ${web3Wallet.fromWei(web3Balance)} ETH\n`);

    console.log("✅ Demo completed successfully!");

  } catch (error: any) {
    console.error("❌ Error in demo:", error.message || error);
  }
}

// Allow this script to be run directly
main().catch(console.error);