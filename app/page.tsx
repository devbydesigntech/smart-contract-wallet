'use client';

import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { WalletDashboard } from '@/components/WalletDashboard';
import { useWallet } from '@/hooks/useWallet';

export default function Home() {
  const { isConnected, address, balance } = useWallet();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg min-h-96">
        <div className="p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Smart Contract Wallet
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Secure wallet with guardian-based recovery and spending limits
            </p>
          </div>

          <div className="mt-8">
            {!isConnected ? (
              <WalletConnect />
            ) : (
              <WalletDashboard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}