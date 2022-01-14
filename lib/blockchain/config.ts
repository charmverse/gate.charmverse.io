
export const VALID_CHAIN_IDS = [1, 4, 137, 80001] as const;
export const VALID_TOKEN_TYPES = ['ERC721', 'ERC20'] as const;
export type ChainId = typeof VALID_CHAIN_IDS[number];
export type TokenType = typeof VALID_TOKEN_TYPES[number];

export const SUPPORTED_BLOCKCHAINS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 4, name: 'Ethereum Testnet (Rinkeby)' },
  { id: 137, name: 'Polygon' },
  { id: 80001, name: 'Polygon Testnet (Mumbai)' }
];

export const SCANNER_URLS: Record<string, string> = {
  1: 'https://etherscan.io/address/',
  4: 'https://rinkeby.etherscan.io/address/',
  137: 'https://polygonscan.com/address/',
  80001: 'https://mumbai.polygonscan.com/address/'
};
