'use client';
import { useWallet } from '@/lib/hooks/useWallet';
import { shortAddress } from '@/lib/format';
import { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

function getAddressGradient(address?: string | null): string {
  if (!address) return 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
  const clean = address.toLowerCase().replace(/^0x/, '').padEnd(12, '0');
  const color1 = `#${clean.slice(0, 6)}`;
  const color2 = `#${clean.slice(-6)}`;
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

export function WalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarGradient = useMemo(() => getAddressGradient(address), [address]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
      setIsOpen(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <button 
        onClick={connect}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
      >
        <div 
          className="w-5 h-5 rounded-full shrink-0" 
          style={{ background: avatarGradient }}
        />
        <span className="font-medium text-sm">{shortAddress(address)}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
          <button 
            onClick={copyAddress}
            className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm transition-colors"
          >
            Copy address
          </button>
          <div className="h-px bg-slate-700 w-full" />
          <button 
            onClick={() => { disconnect(); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
