const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SmartContractWallet...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", await deployer.getAddress());
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy the contract
  const SmartContractWallet = await ethers.getContractFactory("SmartContractWallet");
  const wallet = await SmartContractWallet.deploy();
  
  await wallet.waitForDeployment();
  const address = await wallet.getAddress();

  console.log("SmartContractWallet deployed to:", address);
  console.log("Owner:", await wallet.owner());
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: address,
    deployer: await deployer.getAddress(),
    network: await deployer.provider.getNetwork(),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});