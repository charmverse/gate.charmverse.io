
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { NotionGateLock } from '../api';
import { getContractUrl } from '../lib/blockchain';
import BlockchainLogo from './BlockchainLogo';

type Props = Pick<NotionGateLock, 'POAPEventName' | 'tokenChainId' | 'tokenAddress' | 'lockType' | 'tokenMin' | 'tokenName' | 'tokenSymbol'>;

export default function TokenAccessCriteria ({ POAPEventName, tokenChainId, tokenAddress, tokenMin, tokenName, lockType, tokenSymbol, onEdit, onDelete }: Props & { onDelete?: () => void, onEdit?: () => void }) {

  const contractUrl = getContractUrl(tokenChainId, tokenAddress);

  function confirmDeleteLock () {
    if (confirm('Remove this criteria?')) {
      onDelete();
    }
  }

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
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <div></div>
        {lockType === 'ERC721'
          ? <span>Hold {tokenMin > 1 ? 'at least ' + tokenMin : 'one'} <strong> <Link href={contractUrl} target='_blank'>{tokenName}</Link> NFT</strong></span>
          : (lockType === 'ERC20'
            ? <span>Hold {tokenMin > 1 ? 'at least' : 'a'} <strong>{tokenMin} <Link href={contractUrl} target='_blank'>${tokenSymbol}</Link></strong></span>
            : <span>Hold a <strong>{POAPEventName}</strong> POAP</span>)
        }
        {onEdit && <Box sx={{ minWidth: 80 }}>
          <Tooltip arrow placement='top' title='Edit criteria'>
            <IconButton onClick={onEdit}>
              <EditIcon fontSize='small' sx={{ color: '#aaa' }} />
            </IconButton>
          </Tooltip>
          <Tooltip arrow placement='top' title='Delete criteria'>
            <IconButton onClick={confirmDeleteLock}>
              <DeleteIcon fontSize='small' sx={{ color: '#aaa' }} />
            </IconButton>
          </Tooltip>
        </Box>}
      </Box>
    </Box>
  );
}
