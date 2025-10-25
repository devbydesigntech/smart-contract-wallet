import { ethers } from "ethers";
import { SmartContractWallet__factory } from "../typechain-types";

export class WalletManager {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private contract: any;

  constructor(providerUrl: string, privateKey: string, contractAddress?: string) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    if (contractAddress) {
      this.contract = SmartContractWallet__factory.connect(contractAddress, this.signer);
    }
  }

  async deployContract(): Promise<string> {
    const factory = new SmartContractWallet__factory(this.signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    this.contract = contract;
    return await contract.getAddress();
  }

  async connectToContract(address: string) {
    this.contract = SmartContractWallet__factory.connect(address, this.signer);
  }

  // Owner functions
  async setGuardian(guardianAddress: string, isGuardian: boolean): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.setGuardian(guardianAddress, isGuardian);
  }

  async setAllowance(userAddress: string, amount: bigint): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.setAllowance(userAddress, amount);
  }

  // Guardian functions
  async proposeNewOwner(newOwnerAddress: string): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.proposeNewOwner(newOwnerAddress);
  }

  // Transfer functions
  async transfer(to: string, amount: bigint, payload: string = "0x"): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.transfer(to, amount, payload);
  }

  // View functions
  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }

  async getNextOwner(): Promise<string> {
    return await this.contract.nextOwner();
  }

  async getGuardiansResetCount(): Promise<bigint> {
    return await this.contract.guardiansResetCount();
  }

  async getProposalDeadline(): Promise<bigint> {
    return await this.contract.proposalDeadline();
  }

  async isGuardian(address: string): Promise<boolean> {
    return await this.contract.guardians(address);
  }

  async getAllowance(address: string): Promise<{amount: bigint, isAllowed: boolean}> {
    return await this.contract.allowances(address);
  }

  async hasVoted(proposedOwner: string, guardian: string): Promise<boolean> {
    return await this.contract.hasVoted(proposedOwner, guardian);
  }

  async getBalance(): Promise<bigint> {
    return await this.provider.getBalance(await this.contract.getAddress());
  }

  // Utility functions
  async fundWallet(amount: bigint): Promise<ethers.ContractTransactionResponse> {
    return await this.signer.sendTransaction({
      to: await this.contract.getAddress(),
      value: amount
    });
  }

  formatEther(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  parseEther(amount: string): bigint {
    return ethers.parseEther(amount);
  }
}