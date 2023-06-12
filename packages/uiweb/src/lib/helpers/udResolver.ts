import Resolution from '@unstoppabledomains/resolution';
import { ethers } from 'ethers';
import { allowedNetworks, InfuraAPIKey, NETWORK_DETAILS } from '../config';
import type { Env } from '@pushprotocol/restapi';

export const getUdResolver = (env:Env): Resolution => {
  const l1ChainId = allowedNetworks[env].includes(1) ? 1 : 5;
  const l2ChainId = allowedNetworks[env].includes(137) ? 137 : 80001;
  return Resolution.fromEthersProvider({
    uns: {
      locations: {
        Layer1: {
          network: NETWORK_DETAILS[l1ChainId].network,
          provider: new ethers.providers.InfuraProvider(l1ChainId, InfuraAPIKey),
        },
        Layer2: {
          network: NETWORK_DETAILS[l2ChainId].network,
          provider: new ethers.providers.InfuraProvider(l2ChainId, InfuraAPIKey),
        },
      },
    },
  });
};
