'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

// This would normally be imported from typechain-types
const WALLET_ABI = [
  "function owner() view returns (address)",
  "function guardians(address) view returns (bool)",
  "function allowances(address) view returns (uint256 amount, bool isAllowed)",
  "function setGuardian(address _guardian, bool _isGuardian)",
  "function setAllowance(address _for, uint256 _amount)",
  "function transfer(address payable _to, uint256 _amount, bytes _payload) returns (bytes)",
  "function proposeNewOwner(address payable _newOwner)",
  "function guardiansResetCount() view returns (uint256)",
  "function nextOwner() view returns (address)",
  "function proposalDeadline() view returns (uint256)"
];

export function WalletDashboard() {
  const { address, balance, signer, disconnectWallet } = useWallet();
  const [walletContract, setWalletContract] = useState<ethers.Contract | null>(null);
  const [contractAddress, setContractAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  
  // Form states
  const [guardianAddress, setGuardianAddress] = useState('');
  const [allowanceAddress, setAllowanceAddress] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const connectToContract = async () => {
    if (!signer || !contractAddress) return;
    
    try {
      const contract = new ethers.Contract(contractAddress, WALLET_ABI, signer);
      setWalletContract(contract);
      
      // Check if current user is owner
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address?.toLowerCase());
      
      // Get wallet balance
      const balance = await signer.provider.getBalance(contractAddress);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      alert('Failed to connect to contract. Please check the address.');
    }
  };

  const setGuardian = async () => {
    if (!walletContract || !guardianAddress) return;
    
    try {
      const tx = await walletContract.setGuardian(guardianAddress, true);
      await tx.wait();
      alert('Guardian set successfully!');
      setGuardianAddress('');
    } catch (error) {
      console.error('Failed to set guardian:', error);
      alert('Failed to set guardian');
    }
  };

  const setAllowance = async () => {
    if (!walletContract || !allowanceAddress || !allowanceAmount) return;
    
    try {
      const amount = ethers.parseEther(allowanceAmount);
      const tx = await walletContract.setAllowance(allowanceAddress, amount);
      await tx.wait();
      alert('Allowance set successfully!');
      setAllowanceAddress('');
      setAllowanceAmount('');
    } catch (error) {
      console.error('Failed to set allowance:', error);
      alert('Failed to set allowance');
    }
  };

  const transfer = async () => {
    if (!walletContract || !transferTo || !transferAmount) return;
    
    try {
      const amount = ethers.parseEther(transferAmount);
      const tx = await walletContract.transfer(transferTo, amount, '0x');
      await tx.wait();
      alert('Transfer completed successfully!');
      setTransferTo('');
      setTransferAmount('');
      
      // Refresh wallet balance
      const balance = await signer!.provider.getBalance(contractAddress);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to transfer:', error);
      alert('Transfer failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Wallet Information
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            <p><strong>Connected Address:</strong> {address}</p>
            <p><strong>ETH Balance:</strong> {parseFloat(balance).toFixed(4)} ETH</p>
          </div>
          <div className="mt-3">
            <button
              onClick={disconnectWallet}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Contract Connection */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Connect to Smart Contract Wallet
          </h3>
          <div className="mt-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter contract address"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-3">
            <button
              onClick={connectToContract}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect to Contract
            </button>
          </div>
          
          {walletContract && (
            <div className="mt-4 text-sm text-gray-500">
              <p><strong>Contract Balance:</strong> {parseFloat(walletBalance).toFixed(4)} ETH</p>
              <p><strong>Your Role:</strong> {isOwner ? 'Owner' : 'User'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Functions */}
      {walletContract && isOwner && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Set Guardian */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Set Guardian
              </h3>
              <div className="mt-2">
                <input
                  type="text"
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  placeholder="Guardian address"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={setGuardian}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Set Guardian
                </button>
              </div>
            </div>
          </div>

          {/* Set Allowance */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Set Allowance
              </h3>
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={allowanceAddress}
                  onChange={(e) => setAllowanceAddress(e.target.value)}
                  placeholder="User address"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={allowanceAmount}
                  onChange={(e) => setAllowanceAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={setAllowance}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Set Allowance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Function */}
      {walletContract && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Transfer Funds
            </h3>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient address"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={transfer}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}