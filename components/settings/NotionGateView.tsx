
import styled from '@emotion/styled';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Typography from '@mui/material/Typography';
import { Card, CardContent, Divider, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import NotionSpaceIcon from '../NotionSpaceIcon';
import { NotionGateSettings } from '../../api';


export default function NotionGateView ({ gate, editSettings, deleteSettings }: { gate: NotionGateSettings, editSettings: () => void, deleteSettings: () => void }) {

  const notionUrl = 'https://notion.so/' + gate.spaceDomain;
  const shareUrl = process.env.NEXT_PUBLIC_HOSTNAME + '/notion/' + gate.spaceDomain;
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false);

  function alertCopied () {
    setTooltipIsOpen(true);
    setTimeout(() => setTooltipIsOpen(false), 1000);
  }

  function deleteLock () {
    if (confirm('Members will not be removed from the space automatically. This action cannot be undone. Are you sure?')) {
      deleteSettings();
    }
  }

  return (
    <Card sx={{ width: '100%', mb: 3, boxShadow: 3 }}>
      <CardContent sx={{ pt: 1, px: 4 }}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center'>
            <NotionSpaceIcon src={gate.spaceIcon} />
            <Link href={notionUrl} target='_blank' sx={{ color: 'inherit', fontSize: 24, fontWeight: 'bold', ml: 2 }}>
              {gate.spaceName}
            </Link>
          </Box>
          <Box>
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
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography gutterBottom sx={{ fontSize: 14, fontWeight: 500 }}>Share URL</Typography>
          <CopyToClipboard text={shareUrl} onCopy={() => alertCopied()}>
            <Box display='flex' alignItems='center' sx={{ mb: 1 }}>
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
                <CopyIcon fontSize='small' sx={{ cursor: 'pointer', color: '#777', ml: 1 }} />
              </Tooltip>
            </Box>
          </CopyToClipboard>
      </CardContent>
    </Card>
  );
}
