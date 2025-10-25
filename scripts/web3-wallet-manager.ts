import Web3 from 'web3';

export class Web3WalletManager {
  private web3: Web3;
  private account: string;
  private contract: any;
  private contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CONFIRMATIONS_REQUIRED",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "allowances",
      "outputs": [
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "bool", "name": "isAllowed", "type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "guardians",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "guardiansResetCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "", "type": "address"},
        {"internalType": "address", "name": "", "type": "address"}
      ],
      "name": "hasVoted",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextOwner",
      "outputs": [{"internalType": "address payable", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{"internalType": "address payable", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proposalDeadline",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address payable", "name": "_newOwner", "type": "address"}],
      "name": "proposeNewOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_for", "type": "address"},
        {"internalType": "uint256", "name": "_amount", "type": "uint256"}
      ],
      "name": "setAllowance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_guardian", "type": "address"},
        {"internalType": "bool", "name": "_isGuardian", "type": "bool"}
      ],
      "name": "setGuardian",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address payable", "name": "_to", "type": "address"},
        {"internalType": "uint256", "name": "_amount", "type": "uint256"},
        {"internalType": "bytes", "name": "_payload", "type": "bytes"}
      ],
      "name": "transfer",
      "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  constructor(providerUrl: string, privateKey: string, contractAddress?: string) {
    this.web3 = new Web3(providerUrl);
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.account = account.address;
    
    if (contractAddress) {
      this.contract = new this.web3.eth.Contract(this.contractABI, contractAddress);
    }
  }

  async deployContract(): Promise<string> {
    const contract = new this.web3.eth.Contract(this.contractABI);
    const deployTx = contract.deploy({
      data: '0x' // You'll need to add the actual bytecode here
    });

    const gas = await deployTx.estimateGas({ from: this.account });
    const gasPrice = await this.web3.eth.getGasPrice();

    const deployedContract = await deployTx.send({
      from: this.account,
      gas,
      gasPrice
    });

    this.contract = deployedContract;
    return deployedContract.options.address;
  }

  async connectToContract(address: string) {
    this.contract = new this.web3.eth.Contract(this.contractABI, address);
  }

  // Owner functions
  async setGuardian(guardianAddress: string, isGuardian: boolean): Promise<any> {
    return await this.contract.methods.setGuardian(guardianAddress, isGuardian).send({
      from: this.account
    });
  }

  async setAllowance(userAddress: string, amount: string): Promise<any> {
    return await this.contract.methods.setAllowance(userAddress, amount).send({
      from: this.account
    });
  }

  // Guardian functions
  async proposeNewOwner(newOwnerAddress: string): Promise<any> {
    return await this.contract.methods.proposeNewOwner(newOwnerAddress).send({
      from: this.account
    });
  }

  // Transfer functions
  async transfer(to: string, amount: string, payload: string = "0x"): Promise<any> {
    return await this.contract.methods.transfer(to, amount, payload).send({
      from: this.account
    });
  }

  // View functions
  async getOwner(): Promise<string> {
    return await this.contract.methods.owner().call();
  }

  async getNextOwner(): Promise<string> {
    return await this.contract.methods.nextOwner().call();
  }

  async getGuardiansResetCount(): Promise<string> {
    return await this.contract.methods.guardiansResetCount().call();
  }

  async getProposalDeadline(): Promise<string> {
    return await this.contract.methods.proposalDeadline().call();
  }

  async isGuardian(address: string): Promise<boolean> {
    return await this.contract.methods.guardians(address).call();
  }

  async getAllowance(address: string): Promise<{amount: string, isAllowed: boolean}> {
    return await this.contract.methods.allowances(address).call();
  }

  async hasVoted(proposedOwner: string, guardian: string): Promise<boolean> {
    return await this.contract.methods.hasVoted(proposedOwner, guardian).call();
  }

  async getBalance(): Promise<string> {
    return await this.web3.eth.getBalance(this.contract.options.address);
  }

  // Utility functions
  async fundWallet(amount: string): Promise<any> {
    return await this.web3.eth.sendTransaction({
      from: this.account,
      to: this.contract.options.address,
      value: amount
    });
  }

  fromWei(amount: string): string {
    return this.web3.utils.fromWei(amount, 'ether');
  }

  toWei(amount: string): string {
    return this.web3.utils.toWei(amount, 'ether');
  }
}