# Smart Contract Wallet

A secure Ethereum smart contract wallet with guardian-based recovery, spending limits, and a modern TypeScript/Next.js frontend.

## Features

### 🔐 Security Features
- **Guardian-based Recovery**: Set trusted guardians who can help recover your wallet
- **Multi-signature Owner Changes**: Requires 3 guardian confirmations to change ownership
- **Spending Limits**: Set allowances for different addresses
- **Time-locked Proposals**: Owner change proposals expire after 1 week

### 💼 Wallet Functions
- **Secure Transfers**: Send ETH with optional payload data
- **Allowance Management**: Owner can set spending limits for other addresses
- **Guardian Management**: Add/remove trusted guardians
- **Balance Tracking**: Monitor wallet and user balances

### 🌐 Frontend
- **Next.js 13+ App Router**: Modern React framework
- **Web3 Integration**: Connect with MetaMask and other wallets
- **TypeScript**: Full type safety
- **Tailwind CSS**: Beautiful, responsive design

## Smart Contract Functions

### Owner Functions

#### `setGuardian(address _guardian, bool _isGuardian)`
- **Description**: Add or remove a guardian
- **Access**: Owner only
- **Parameters**:
  - `_guardian`: Address of the guardian
  - `_isGuardian`: True to add, false to remove

#### `setAllowance(address _for, uint256 _amount)`
- **Description**: Set spending allowance for an address
- **Access**: Owner only
- **Parameters**:
  - `_for`: Address to grant allowance to
  - `_amount`: Amount in wei (use 0 to revoke)

### Guardian Functions

#### `proposeNewOwner(address payable _newOwner)`
- **Description**: Propose a new owner (requires 3 confirmations)
- **Access**: Guardians only
- **Parameters**:
  - `_newOwner`: Address of proposed new owner
- **Requirements**:
  - Caller must be a guardian
  - Cannot propose zero address
  - Cannot vote twice for same proposal

### Transfer Functions

#### `transfer(address payable _to, uint256 _amount, bytes memory _payload)`
- **Description**: Transfer ETH with optional contract call
- **Access**: Owner (unlimited) or addresses with allowance
- **Parameters**:
  - `_to`: Recipient address
  - `_amount`: Amount to transfer in wei
  - `_payload`: Optional data for contract calls
- **Returns**: Response data from target contract

### View Functions

#### `owner() → address`
Returns the current owner address

#### `guardians(address) → bool`
Check if an address is a guardian

#### `allowances(address) → (uint256 amount, bool isAllowed)`
Get allowance information for an address

#### `nextOwner() → address`
Get the currently proposed new owner

#### `guardiansResetCount() → uint256`
Get number of confirmations for current owner change proposal

#### `proposalDeadline() → uint256`
Get timestamp when current proposal expires

#### `hasVoted(address proposedOwner, address guardian) → bool`
Check if a guardian has voted for a specific owner proposal

#### `CONFIRMATIONS_REQUIRED() → uint256`
Returns the number of guardian confirmations needed (3)

## Project Structure

```
smart-contract-wallet/
├── contracts/
│   ├── SmartContractWallet.sol    # Main wallet contract
│   └── TestReceiver.sol           # Test contract for payload transfers
├── scripts/
│   ├── deploy.ts                  # Deployment script
│   ├── wallet-manager.ts          # Ethers.js interaction wrapper
│   ├── web3-wallet-manager.ts     # Web3.js interaction wrapper
│   └── demo.ts                    # Demo script
├── test/
│   ├── setup.ts                   # Test configuration
│   └── SmartContractWallet.test.ts # Comprehensive test suite
├── app/
│   ├── layout.tsx                 # Next.js root layout
│   ├── page.tsx                   # Main page
│   └── globals.css                # Global styles
├── components/
│   ├── WalletConnect.tsx          # Wallet connection component
│   └── WalletDashboard.tsx        # Main dashboard interface
├── hooks/
│   └── useWallet.tsx              # Web3 wallet hook
└── Configuration files...
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd smart-contract-wallet
npm install
```

2. **Compile contracts**:
```bash
npm run compile
```

3. **Run tests**:
```bash
npm test
```

4. **Start local blockchain**:
```bash
npm run node
```

5. **Deploy to local network** (in new terminal):
```bash
npm run deploy:local
```

6. **Start frontend**:
```bash
npm run dev
```

7. **Open browser**: Navigate to `http://localhost:3000`

### Environment Setup

Create a `.env` file for mainnet/testnet deployment:
```env
PRIVATE_KEY=your_private_key_here
GOERLI_URL=https://goerli.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Usage Examples

### Using the Scripts

#### Deploy Contract
```typescript
import { WalletManager } from './scripts/wallet-manager';

const manager = new WalletManager(
  "http://localhost:8545",
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const address = await manager.deployContract();
console.log("Deployed to:", address);
```

#### Set Guardian
```typescript
await manager.setGuardian("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", true);
```

#### Set Allowance
```typescript
await manager.setAllowance("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 
  manager.parseEther("1.0"));
```

#### Transfer Funds
```typescript
await manager.transfer("0x8ba1f109551bD432803012645Hac136c", 
  manager.parseEther("0.5"));
```

### Using the Frontend

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Connect to Contract**: Enter deployed contract address and click "Connect to Contract"
3. **Owner Functions** (if you're the owner):
   - Set guardians by entering their addresses
   - Set spending allowances for other users
4. **Transfer Funds**: Send ETH to any address (respects allowance limits)

## Testing

The project includes comprehensive tests covering:

- ✅ Contract deployment and initialization
- ✅ Guardian management (add/remove)
- ✅ Owner recovery process with multi-sig
- ✅ Spending limit enforcement
- ✅ Transfer functionality with payload support
- ✅ Edge cases and error conditions

Run tests with:
```bash
npm test
```

## Security Considerations

### Guardian Setup
- Choose trustworthy guardians who won't collude
- Use geographically and socially distributed guardians
- Consider using multisig wallets as guardians

### Allowance Management
- Set conservative allowances
- Regularly review and update allowances
- Monitor allowance usage

### Proposal Timeouts
- Proposals expire after 1 week for security
- Expired proposals need to be resubmitted
- Consider the timeout when coordinating with guardians

## Development

### Adding New Features

1. **Smart Contract**: Add functions to `contracts/SmartContractWallet.sol`
2. **Scripts**: Update managers in `scripts/` folder
3. **Tests**: Add test cases in `test/SmartContractWallet.test.ts`
4. **Frontend**: Update components in `components/` folder

### Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server

# Blockchain
npm run node         # Start local Hardhat node
npm run compile      # Compile contracts
npm run deploy:local # Deploy to local network
npm run clean        # Clean artifacts

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Run `npm install` to ensure all dependencies are installed

2. **Hardhat compilation errors**: Check Solidity version compatibility in `hardhat.config.ts`

3. **MetaMask connection issues**: 
   - Ensure you're on the correct network
   - Reset MetaMask account if needed
   - Clear browser cache

4. **Transaction failures**:
   - Check gas limits
   - Verify contract address is correct
   - Ensure sufficient ETH balance

5. **Frontend build issues**: 
   - Run `npm run build` to check for TypeScript errors
   - Ensure all imports are correct

### Getting Help

- Check the test files for usage examples
- Review error messages in browser console
- Ensure MetaMask is connected to the correct network
- Verify contract is deployed and funded

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

**⚠️ Security Notice**: This is a demonstration project. For production use, conduct thorough security audits and consider additional safety measures.