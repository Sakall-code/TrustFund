'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Decentralized Crowdfund',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});
