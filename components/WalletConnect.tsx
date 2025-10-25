'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';

export function WalletConnect() {
  const { connectWallet } = useWallet();

  return (
    <div className="text-center">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Connect Your Wallet
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Connect your MetaMask or other Web3 wallet to interact with your Smart Contract Wallet.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={connectWallet}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}