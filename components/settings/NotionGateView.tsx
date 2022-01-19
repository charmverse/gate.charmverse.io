
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Typography from '@mui/material/Typography';
import { buttonUnstyledClasses, Card, CardContent, CircularProgress, Divider, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabUnstyled, { tabUnstyledClasses } from '@mui/base/TabUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import { useFormState, useLoadingState } from '../../lib/react';
import { POST, GET, DELETE, PUT } from '../../lib/http';
import Page, { PageSection } from '../../layouts/Page';
import { SUPPORTED_BLOCKCHAINS } from '../../lib/blockchain';
import debounce from '../../lib/debounce';
import Button from '../Button';
import NotionSpaceIcon from '../NotionSpaceIcon';
import TrimmedContent from '../TrimmedContent';
import PrimaryButton from '../PrimaryButton';
import TokenAccessCriteria from '../TokenAccessCriteria';
import InputLoadingIcon from '../InputLoadingIcon';
import POAPSelect from '../POAPSelect';
import { LockType, NotionGateLock, NotionGateSettings, NotionGateSettingsWithLocks } from '../../api';


export default function NotionGateView ({ gate, editSettings, deleteSettings }: { gate: NotionGateSettings, editSettings: () => void, deleteSettings: () => void }) {

  const notionUrl = 'https://notion.so/' + gate.spaceDomain;
  const shareUrl = process.env.NEXT_PUBLIC_HOSTNAME + '/notion/' + gate.spaceDomain;
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false);

  function alertCopied () {
    setTooltipIsOpen(true);
    setTimeout(() => setTooltipIsOpen(false), 2000);
  }

  function deleteLock () {
    if (confirm('Members will not be removed from the space automatically. This action cannot be undone. Are you sure?')) {
      deleteSettings();
    }
  }

  return (<>
    <CardContent sx={{ px: 4, pt: 3, pb: 2, position: 'relative' }}>

      <div>
        <Typography variant='h2' gutterBottom>
          <Link href={notionUrl} target='_blank'>{gate.spaceName}</Link>
        </Typography>
        <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Share URL</Typography>
          <CopyToClipboard text={shareUrl} onCopy={() => alertCopied()}>
            <Box display='flex' alignItems='center'>
              <Typography>
                <Link href={shareUrl} target='_blank'>{shareUrl}</Link>
              </Typography>
              <Tooltip
                arrow
                placement='top'
                disableFocusListener
                disableHoverListener
                disableTouchListener
                onOpen={() => setTooltipIsOpen(true)}
                onClose={() => setTooltipIsOpen(false)}
                open={tooltipIsOpen}
                title='Copied!'
              >
                <CopyIcon sx={{ cursor: 'pointer', color: '#777', ml: 1 }} />
              </Tooltip>
            </Box>
          </CopyToClipboard>
      </div>
      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <Tooltip arrow placement='top' title='Edit gate'>
          <IconButton onClick={editSettings}>
            <EditIcon sx={{ color: '#aaa' }} />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement='top' title='Delete gate'>
          <IconButton onClick={deleteLock}>
            <DeleteIcon sx={{ color: '#aaa' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </CardContent>
  </>);
}
