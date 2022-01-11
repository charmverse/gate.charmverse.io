
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { NotionGate } from '../api';
import { getContractUrl } from '../lib/blockchain';
import BlockchainLogo from './BlockchainLogo';

export default function TokenAccessCriteria ({ tokenChainId, tokenAddress, tokenMin, tokenName, tokenType, tokenSymbol }: Pick<NotionGate, 'tokenChainId' | 'tokenAddress' | 'tokenType' | 'tokenMin' | 'tokenName' | 'tokenSymbol'>) {
  const contractUrl = getContractUrl(tokenChainId, tokenAddress);
  return (
    <Box
      sx={{
        p: 3,
        pl: 8,
        mb: 2,
        background: 'white',
        borderRadius: 5,
        textAlign: 'center',
        border: '1px solid #ccc',
        position: 'relative',
        width: '100%',
      }}
    >
      <Box sx={{
        position: 'absolute', left: 0, top: 0,
        height: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: 50,
        background: '#fafafa',
        borderRight: '1px solid #ccc', borderBottomLeftRadius: 20, borderTopLeftRadius: 20
      }}>
        <BlockchainLogo chainId={tokenChainId} />
      </Box>

      {tokenType === 'ERC721'
        ? <span>Own at least <strong>{tokenMin} <Link href={contractUrl} target='_blank'>{tokenName}</Link> NFT</strong></span>
        : <span>Hold at least <strong>{tokenMin} <Link href={contractUrl} target='_blank'>${tokenSymbol}</Link></strong></span>
      }
    </Box>
  );
}
