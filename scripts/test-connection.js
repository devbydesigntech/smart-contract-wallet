const { ethers } = require("hardhat");

async function testConnection() {
  console.log("Testing contract connection...");
  
  // Contract address from deployment.json
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Get signers
  const [owner] = await ethers.getSigners();
  console.log("Using account:", await owner.getAddress());
  
  // Connect to the deployed contract
  const SmartContractWallet = await ethers.getContractFactory("SmartContractWallet");
  const wallet = SmartContractWallet.attach(contractAddress);
  
  // Test basic functions
  console.log("Contract owner:", await wallet.owner());
  console.log("Confirmations required:", await wallet.CONFIRMATIONS_REQUIRED());
  
  // Check contract balance
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract balance:", ethers.formatEther(balance), "ETH");
  
  // Test setting a guardian
  const guardianAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  console.log("Setting guardian:", guardianAddress);
  
  const tx = await wallet.setGuardian(guardianAddress, true);
  await tx.wait();
  console.log("Guardian set successfully!");
  
  // Verify guardian was set
  const isGuardian = await wallet.guardians(guardianAddress);
  console.log("Is guardian:", isGuardian);
  
  console.log("✅ Contract connection test successful!");
}

testConnection().catch((error) => {
  console.error("❌ Connection test failed:", error);
});