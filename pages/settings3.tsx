
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Typography from '@mui/material/Typography';
import { buttonUnstyledClasses, Card, CardContent, CircularProgress, Divider, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import PlusIcon from '@mui/icons-material/Add';
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
import { useFormState, useLoadingState } from '../lib/react';
import { POST, GET, DELETE, PUT } from '../lib/http';
import Page, { PageSection } from '../layouts/Page';
import { SUPPORTED_BLOCKCHAINS } from '../lib/blockchain';
import debounce from '../lib/debounce';
import Button from '../components/Button';
import NotionSpaceIcon from '../components/NotionSpaceIcon';
import TrimmedContent from '../components/TrimmedContent';
import PrimaryButton from '../components/PrimaryButton';
import TokenAccessCriteria from '../components/TokenAccessCriteria';
import InputLoadingIcon from '../components/InputLoadingIcon';
import POAPSelect from '../components/POAPSelect';
import { LockType, NotionGateLock, NotionGateSettings, NotionGateSettingsWithLocks } from '../api';
import NotionGateView from '../components/settings/NotionGateView';
import { useRouter } from 'next/router';


const lockTypes: { id: LockType, name: string, label: string }[] = [
  { id: 'ERC20', name: 'ERC-20', label: 'Hold an NFT' },
  { id: 'ERC721', name: 'ERC-721', label: 'Hold a Token' },
  { id: 'POAP', name: 'POAP', label: 'Hold a POAP' }
];

interface Space {
  domain: string;
  icon: string;
  id: string;
  isAdmin: boolean;
  name: string;
}

// TODO: Delete this and rely on NotionGateSettings instead
interface Settings {
  createdAt?: string;
  lockId?: string;
  addressWhitelist: string[];
  spaceIsAdmin?: boolean;
  spaceBlockIds: string[];
  spaceBlockUrls: string[];
  spaceDefaultUrl?: string;
  spaceDomain: string;
  spaceName: string;
  spaceIcon: string;
  spaceId: string;
  POAPEventId?: number;
  POAPEventName?: string;
  tokenAddress: string;
  tokenChainId: number;
  tokenName: string;
  tokenSymbol: string;
  tokenMin: number
  lockType: LockType;
}

interface Form extends Settings {
  step: number;
  error?: string;
  saving?: boolean;
}

interface User {
  id: string;
  icon: string;
  address?: string;
}


export const getServerSideProps = async (ctx: any) => {
  console.log('headers', ctx.headers);
  return {
    props: {
      gate: null
    }
  };
};

export default function SettingsPage () {

  const [activeForm, setActiveForm] = useState<'gate' | 'lock' | null>(null);
  const [gate, setGate] = useLoadingState<{ data: NotionGateSettings | null }>({ data: null});
  const [locks, setLocks] = useState<NotionGateLock[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    GET<NotionGateSettingsWithLocks | null>('/settings')
      .then(data => {
        if (data) {
          setGate({ loading: false, data });
          setLocks(data.locks);
        }
        else {
          setGate({ loading: false });
        }
      });
  }, []);

  useEffect(() => {
    if (gate.data?.spaceId) {
      GET<User[]>('/notion/getUsers')
        .then(_users => {
          setUsers(_users);
        });
    }
  }, [gate.data?.spaceId]);

  // useEffect(() => {
  //   if (form.step !== -1) {
  //     GET('/track/page_view', {
  //       title: FORM_STEP_TITLES[form.step]
  //     });
  //   }
  // }, [form.step]);


  function editGateSettings () {
    setActiveForm('gate');
  }

  function onSubmitGateSettings (gate: NotionGateSettings) {
    setActiveForm(null);
    setGate({ data: gate });
  }

  function deleteGateSettings () {
    if (gate.data.spaceDomain) {
      DELETE('/settings', { domain: gate.data.spaceDomain })
        .then(() => {
          router.push('/onboarding');
        });
    }
  }

  const authorizedMembers = users.filter(user => !!user.address);
  const unauthorizedMembers = users.filter(user => !user.address);

  return (
    <Page title={'Notion Token Gate'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>

        <Typography gutterBottom variant='h6'>Notion Workspace</Typography>

        <Card sx={{ width: '100%', mb: 3 }}>
          {gate.data && <NotionGateView gate={gate.data} editSettings={editGateSettings} deleteSettings={deleteGateSettings} />}
        </Card>

        <Typography gutterBottom variant='h6'>Access Criteria</Typography>

        {locks.map(lock => (
          <TokenAccessCriteria {...lock} key={lock.id} />
        ))}

        <Typography sx={{ mt: 2, mb: 2 }} variant='h6'>Add more</Typography>
        <Grid container spacing={3}>
          {lockTypes.map(lockType => (
            <Grid item xs={4} key={lockType.id}>
              <Button
                fullWidth={true}
                startIcon={<PlusIcon sx={{ float: 'left', fontSize: 24 }} />} variant='outlined' size='large' onClick={() => addLock(lockType.id)}
                sx={{ display: 'block', borderRadius: '20px', p: 3 }}>
                {lockType.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        <FormHelperText sx={{ mt: 2, mb: 6, textAlign: 'center' }}>
          Questions or feature requests? Email <Link sx={{ color: 'inherit', fontWeight: 'bold' }} href='mailto:hello@charmverse.io'>hello@charmverse.io</Link>
        </FormHelperText>
        <Box sx={{ pb: 4 }}>
          <Typography variant='h2'>
            Authorized Members <Chip size='small' label={authorizedMembers.length} />
          </Typography>
          <br />
          <Grid container columnSpacing={2} rowSpacing={3} justifyContent='flex-start'>
            {authorizedMembers.map(user => (
              <Grid component={Box} item key={user.id} sx={{ width: 80 }} display='flex' alignItems='center' justifyContent='flex-start' flexDirection='column'>
                <Avatar src={user.icon} />
                <Typography variant='body2' sx={{ my: 2 }}>
                  <strong>{shortenedContractAddresss(user.address)}</strong>
                </Typography>
              </Grid>
            ))}
          </Grid>
          <br />
          {(unauthorizedMembers.length > 0) && <>
            <Typography variant='h2'>
              Other Notion Users <Chip size='small' label={unauthorizedMembers.length} />
            </Typography>
            <br />
            <Grid container columnSpacing={2} rowSpacing={3} justifyContent='flex-start'>
              {unauthorizedMembers.map(user => (
                <Grid component={Box} item key={user.id} sx={{ width: 80 }} display='flex' alignItems='center' justifyContent='flex-start' flexDirection='column'>
                  <Avatar src={user.icon} />
                </Grid>
              ))}
            </Grid>
          </>}
        </Box>
      </PageSection>
    </Page>
  );
}
const shortenedContractAddresss = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};
