'use client';

/**
 * Minimal EIP-1193 wallet provider glue for MetaMask. No third-party
 * dependency: the CMS only needs eth_requestAccounts, eth_chainId and
 * personal_sign, all of which the injected provider exposes natively.
 */

export interface WalletProvider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on(eventName: string, handler: (...args: unknown[]) => void): void;
  removeListener(eventName: string, handler: (...args: unknown[]) => void): void;
}

export interface WalletConnection {
  /** Checksummed address reported by the provider. */
  address: string;
  /** Decimal chain id, e.g. 1 for Ethereum mainnet. */
  chainId: number;
}

declare global {
  interface Window {
    ethereum?: WalletProvider;
  }
}

export class WalletError extends Error {
  constructor(
    message: string,
    readonly code?: string | number,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

/** MetaMask user-rejection code (EIP-1193 provider error code 4001). */
export const USER_REJECTED = 4001;

export function getProvider(): WalletProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new WalletError(
      'MetaMask tidak terdeteksi. Pasang ekstensi MetaMask, lalu muat ulang halaman ini.',
      'NO_PROVIDER',
    );
  }
  return window.ethereum;
}

/**
 * Requests account access and returns the active connection. The address
 * returned here is only used to request a challenge; authorization always
 * comes from the server recovering the signature.
 */
export async function connectWallet(): Promise<WalletConnection> {
  const provider = getProvider();
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new WalletError('Tidak ada akun yang terhubung di MetaMask.', 'NO_ACCOUNT');
  }

  let chainId: number;
  try {
    chainId = Number.parseInt(chainIdHex, 16);
  } catch {
    chainId = 0;
  }

  return { address: accounts[0], chainId };
}

/** Asks MetaMask to sign an arbitrary message (personal_sign / EIP-191). */
export async function signMessage(message: string): Promise<string> {
  const provider = getProvider();
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new WalletError('Tidak ada akun yang terhubung di MetaMask.', 'NO_ACCOUNT');
  }
  const signature = (await provider.request({
    method: 'personal_sign',
    params: [message, accounts[0]],
  })) as string;
  return signature;
}

/** Converts an EIP-1193 provider error into a friendly WalletError. */
export function mapProviderError(error: unknown): WalletError {
  const raw = error as { code?: number | string; message?: string };
  if (raw?.code === USER_REJECTED || raw?.code === 'ACTION_REJECTED') {
    return new WalletError('Anda menolak tanda tangan. Login dibatalkan.', 'REJECTED');
  }
  if (raw?.code === -32601) {
    return new WalletError('Wallet tidak mendukung metode penandatanganan yang dibutuhkan.', 'UNSUPPORTED');
  }
  const message = raw?.message ? raw.message.replace(/^MetaMask\s*-\s*/i, '') : 'Terjadi kesalahan pada wallet.';
  return new WalletError(message.slice(0, 200), 'PROVIDER_ERROR');
}

/** Subscribe to wallet account/chain changes. Returns an unsubscribe fn. */
export function watchWallet(
  onAccountChanged: () => void,
  onChainChanged: () => void,
): () => void {
  const provider = getProvider();
  provider.on('accountsChanged', onAccountChanged);
  provider.on('chainChanged', onChainChanged);
  return () => {
    provider.removeListener('accountsChanged', onAccountChanged);
    provider.removeListener('chainChanged', onChainChanged);
  };
}

export function hasWalletProvider(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}
