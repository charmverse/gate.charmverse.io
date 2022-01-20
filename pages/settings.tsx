
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Divider, FormHelperText, FormLabel, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import PlusIcon from '@mui/icons-material/Add';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import Avatar from '@mui/material/Avatar';
import { useLoadingState } from '../lib/react';
import { GET, DELETE } from '../lib/http/browser';
import { GET as serverGET } from '../lib/http/server';
import Page, { PageSection } from '../layouts/Page';
import Button from '../components/Button';
import TokenAccessCriteria from '../components/TokenAccessCriteria';
import { LockType, NotionGateLock, NotionGateSettings, NotionGateSettingsWithLocks } from '../api';
import NotionGateForm from '../components/common/NotionGateForm';
import NotionLockForm from '../components/common/NotionLockForm';
import NotionGateView from '../components/settings/NotionGateView';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { LOCK_TYPES } from '../lib/blockchain/config';

const ModalBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  background: white;
  border-radius: 20px;
`;


interface User {
  id: string;
  icon: string;
  address?: string;
}


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const gate = await serverGET(process.env.NEXT_PUBLIC_API + `/settings`, {}, {
      headers: {
        // include headers from the client to include auth
        cookie: ctx.req.headers.cookie,
      }
    })
    if (!gate) {
      return {
        redirect: {
          destination: '/onboarding',
        }
      }
    }
    return {
      props: {
        gateSettings: gate
      }
    };
  }
  // most likely an auth error
  catch (e) {
    return {
      redirect: {
        destination: '/login',
      }
    }
  }
};

export default function SettingsPage ({ gateSettings }: { gateSettings: NotionGateSettingsWithLocks }) {

  const [activeForm, setActiveForm] = useState<'gate' | 'lock' | null>(null);
  const [activeLock, setActiveLock] = useState<Partial<NotionGateLock> | null>(null);
  const [gate, setGate] = useLoadingState<NotionGateSettings>(gateSettings);
  const [locks, setLocks] = useState<NotionGateLock[]>(gateSettings.locks);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (gate.spaceId) {
      GET<User[]>('/notion/getUsers')
        .then(_users => {
          setUsers(_users);
        });
    }
  }, [gate.spaceId]);

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

  function editLockSettings (lock: NotionGateLock) {
    setActiveForm('lock');
    setActiveLock(lock);
  }

  function deleteLockSettings (lockId: string) {
      DELETE('/settings/locks/' + lockId)
        .then(() => {
          setLocks(locks.filter(lock => lock.id !== lockId));
        });
  }

  function onSubmitGateSettings (gate: NotionGateSettings) {
    setActiveForm(null);
    setGate(gate);
  }

  function onSubmitLockSettings (lock: NotionGateLock) {
    setActiveForm(null);
    setActiveLock(null);
    const existing = locks.find(l => l.id === lock.id);
    if (existing) {
      setLocks(locks.map(l => l.id === lock.id ? lock : l));
    }
    else {
      setLocks([...locks, lock]);
    }
  }

  function closeModal () {
    setActiveForm(null);
  }

  function deleteGateSettings () {
    if (gate.spaceDomain) {
      DELETE('/settings', { domain: gate.spaceDomain })
        .then(() => {
          router.push('/onboarding');
        });
    }
  }

  function addLock (lockType: LockType) {
    setActiveForm('lock');
    console.log('add', lockType)
    setActiveLock({ lockType });
  }

  const authorizedMembers = users.filter(user => !!user.address);
  const unauthorizedMembers = users.filter(user => !user.address);

  return (
    <Page title={'Notion Token Gate'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>

        <Typography gutterBottom variant='h6'>Notion Workspace</Typography>

        <NotionGateView gate={gate} editSettings={editGateSettings} deleteSettings={deleteGateSettings} />

        <Typography gutterBottom variant='h6'>Access Criteria</Typography>

        {locks.map((lock, i) => (<div key={i}>
          <TokenAccessCriteria {...lock} key={lock.id} onDelete={() => deleteLockSettings(lock.id)} onEdit={() => editLockSettings(lock)} />
          {i < locks.length - 1 && <Box display='flex' justifyContent='center' mb={1}>or</Box>}
        </div>))}

        {locks.length > 0 && <Typography sx={{ mt: 2, mb: 2 }} variant='h2'>Add more</Typography>}
        <Grid container spacing={3}>
          {LOCK_TYPES.map(lockType => (
            <Grid item xs={4} key={lockType.id}>
              <Button
                fullWidth={true}
                startIcon={<PlusIcon sx={{ float: 'left', fontSize: 24 }} />} variant='outlined' size='large' onClick={() => addLock(lockType.id)}
                sx={{ display: 'block', borderRadius: '20px', p: 2 }}>
                {lockType.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        <FormHelperText sx={{ my: 4, textAlign: 'center' }}>
          Questions or feature requests? Email <Link sx={{ color: 'inherit', fontWeight: 'bold' }} href='mailto:hello@charmverse.io'>hello@charmverse.io</Link>
        </FormHelperText>
        <Divider />
        <Box sx={{ pt: 4, pb: 4 }}>
          <Typography variant='h2'>
            Authorized Members <Chip size='small' label={authorizedMembers.length} />
          </Typography>
          <br />
          <Grid container columnSpacing={2} rowSpacing={3} justifyContent='flex-start'>
            {authorizedMembers.map(user => (
              <Grid component={Box} item key={user.id} sx={{ width: 80 }} display='flex' alignItems='center' justifyContent='flex-start' flexDirection='column'>
                <Avatar src={user.icon} />
                <Typography variant='body2' sx={{ my: 2 }}>
                  {shortenedContractAddresss(user.address)}
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

      <Modal open={!!activeForm} onClose={(closeModal)}>
        <ModalBox sx={{ boxShadow: 24, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <CloseIcon style={{ cursor: 'pointer' }} onClick={closeModal} />
          </Box>
          {activeForm === 'gate' && <NotionGateForm gate={gate} onSubmit={onSubmitGateSettings} />}
          {activeForm === 'lock' && <NotionLockForm gateId={gate.id} hasAdminAccess={gate.spaceIsAdmin} lock={activeLock} onSubmit={onSubmitLockSettings} />}
        </ModalBox>
      </Modal>
    </Page>
  );
}
const shortenedContractAddresss = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};
