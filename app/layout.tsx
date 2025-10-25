import './globals.css'
import { Inter } from 'next/font/google'
import { WalletProvider } from '@/hooks/useWallet'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Smart Contract Wallet',
  description: 'A secure smart contract wallet with guardian-based recovery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Smart Contract Wallet
                    </h1>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}