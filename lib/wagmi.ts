'use client';

import { createConfig, http } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { RPC_URL } from './constants';

export const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(RPC_URL),
  },
  ssr: true,
});
