import { SUPPORTED_BLOCKCHAINS, ChainId } from './config';
import { SCANNER_URLS } from './config';
export * from './config';

export function getBlockChainName (chainId: ChainId) {
  return SUPPORTED_BLOCKCHAINS.find(blockchain => blockchain.id === chainId)?.name;
}

export function getContractUrl (chainId: number, address: string): string {
  return SCANNER_URLS[chainId] + address;
}

export const shortenedContractAddress = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};

