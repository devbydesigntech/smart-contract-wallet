const { WalletManager } = require('./wallet-manager');

async function main() {
  const PROVIDER_URL = "http://localhost:8545";
  const PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  
  console.log("=== Simple Smart Contract Wallet Demo ===\n");

  try {
    const wallet = new WalletManager(PROVIDER_URL, PRIVATE_KEY);
    
    // Deploy contract
    console.log("Deploying contract...");
    const address = await wallet.deployContract();
    console.log(`✓ Contract deployed at: ${address}\n`);

    // Check owner
    const owner = await wallet.getOwner();
    console.log(`✓ Owner: ${owner}\n`);

    // Fund wallet (with proper tx waiting)
    console.log("Funding wallet with 1 ETH...");
    const fundTx = await wallet.fundWallet(wallet.parseEther("1.0"));
    const fundReceipt = await fundTx.wait();
    console.log(`✓ Funded! Tx hash: ${fundReceipt.hash}\n`);

    // Check balance
    const balance = await wallet.getBalance();
    console.log(`✓ Balance: ${wallet.formatEther(balance)} ETH\n`);

    // Small delay to ensure nonce updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Set guardian (with proper tx waiting)
    const guardianAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    console.log(`Setting guardian: ${guardianAddress}...`);
    const guardianTx = await wallet.setGuardian(guardianAddress, true);
    const guardianReceipt = await guardianTx.wait();
    console.log(`✓ Guardian set! Tx hash: ${guardianReceipt.hash}\n`);

    // Verify guardian
    const isGuardian = await wallet.isGuardian(guardianAddress);
    console.log(`✓ Is guardian: ${isGuardian}\n`);

    console.log("✅ Demo completed successfully!");

  } catch (error) {
    console.error("❌ Error in demo:", error.message || error);
  }
}

main().catch(console.error);
