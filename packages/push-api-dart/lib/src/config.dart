// ignore_for_file: non_constant_identifier_names, constant_identifier_names

import 'constants.dart';

// for methods not needing the entire config
const Map<ENV, String> API_BASE_URL = {
  ENV.PROD: 'https://backend.epns.io/apis',
  ENV.STAGING: 'https://backend-staging.epns.io/apis',
  ENV.DEV: 'https://backend-dev.epns.io/apis',
  /**
   * **This is for local development only**
   */
  ENV.LOCAL: 'http://localhost:4200/apis',
};

String getAPIBaseUrls(ENV env) {
  return API_BASE_URL[env] ?? 'http://localhost:4000/apis';
}

const BLOCKCHAIN_NETWORK = {
  'ETH_MAINNET': 'eip155:1',
  'ETH_GOERLI': 'eip155:5',
  'POLYGON_MAINNET': 'eip155:137',
  'POLYGON_MUMBAI': 'eip155:80001',
  'BSC_MAINNET': 'eip155:56',
  'BSC_TESTNET': 'eip155:97',
  'OPTIMISM_TESTNET': 'eip155:420',
  'OPTIMISM_MAINNET': 'eip155:10',
  'POLYGON_ZK_EVM_TESTNET': 'eip155:1442',
  'POLYGON_ZK_EVM_MAINNET': 'eip155:1101'
};

// typedef ALIAS_CHAIN = 'POLYGON' | 'BSC' | 'OPTIMISM' | 'POLYGONZKEVM';

const ALIAS_CHAIN_ID = {
  'POLYGON': {
    ENV.PROD: 137,
    ENV.STAGING: 80001,
    ENV.DEV: 80001,
    ENV.LOCAL: 80001,
  },
  'BSC': {
    ENV.PROD: 56,
    ENV.STAGING: 97,
    ENV.DEV: 97,
    ENV.LOCAL: 97,
  },
  'OPTIMISM': {
    ENV.PROD: 10,
    ENV.STAGING: 420,
    ENV.DEV: 420,
    ENV.LOCAL: 420,
  },
  'POLYGONZKEVM': {
    ENV.PROD: 1101,
    ENV.STAGING: 1442,
    ENV.DEV: 1442,
    ENV.LOCAL: 420,
  }
};

class ConfigType {
  String? API_BASE_URL;
  String EPNS_COMMUNICATOR_CONTRACT;

  ConfigType({
    required this.API_BASE_URL,
    required this.EPNS_COMMUNICATOR_CONTRACT,
  });
}

final CONFIG = {
  ENV.PROD: {
    BLOCKCHAIN_NETWORK['ETH_MAINNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_MAINNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['BSC_MAINNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['OPTIMISM_MAINNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_ZK_EVM_MAINNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
  },
  ENV.STAGING: {
    BLOCKCHAIN_NETWORK['ETH_GOERLI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_MUMBAI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['BSC_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['OPTIMISM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_ZK_EVM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    ),
  },
  ENV.DEV: {
    BLOCKCHAIN_NETWORK['ETH_GOERLI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_MUMBAI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    ),
    BLOCKCHAIN_NETWORK['BSC_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    ),
    BLOCKCHAIN_NETWORK['OPTIMISM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_ZK_EVM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    ),
  },
  ENV.LOCAL: {
    BLOCKCHAIN_NETWORK['ETH_GOERLI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_MUMBAI']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    ),
    BLOCKCHAIN_NETWORK['BSC_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    ),
    BLOCKCHAIN_NETWORK['OPTIMISM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    ),
    BLOCKCHAIN_NETWORK['POLYGON_ZK_EVM_TESTNET']: ConfigType(
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    ),
  },
};
