
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { buttonUnstyledClasses, Card, CardContent, CircularProgress, Divider, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormState, useLoadingState } from '../../lib/react';
import { POST, GET, DELETE, PUT } from '../../lib/http';
import Page, { PageSection } from '../../layouts/Page';
import Button from '../Button';
import NotionSpaceIcon from '../NotionSpaceIcon';
import TrimmedContent from '../TrimmedContent';
import PrimaryButton from '../PrimaryButton';
import InputLoadingIcon from '../InputLoadingIcon';
import { LockType, NotionGateSettings } from '../../api';


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


const FORM_STEP_TITLES = {
  0: 'Settings Home: Gate summary',
  1: 'Settings 1/4: Set Notion domain',
  2: 'Settings 2/4: Add CharmVerse admin',
  3: 'Settings 3/4: Set Notion preferences',
  4: 'Settings 4/4: Set token criteria'
}

export default function SettingsPage () {

  const [form, setForm] = useFormState<Form>({ spaceBlockIds: [], spaceBlockUrls: [], step: -1 });

  useEffect(() => {
    GET<NotionGateSettings | null>('/settings')
      .then(res => {
        if (res) {
          const settings: Settings = {
            createdAt: res.createdAt,
            spaceIsAdmin: res.spaceIsAdmin,
            spaceDomain: res.spaceDomain,
            spaceName: res.spaceName,
            spaceIcon: res.spaceIcon,
            spaceId: res.spaceId,
            // lock settings
            lockId: res.locks[0].id,
            lockType: res.locks[0].lockType,
            addressWhitelist: res.locks[0].addressWhitelist,
            spaceBlockIds: res.locks[0].spaceBlockIds,
            spaceBlockUrls: res.locks[0].spaceBlockUrls,
            spaceDefaultUrl: res.locks[0].spaceDefaultUrl,
            POAPEventId: res.locks[0].POAPEventId,
            POAPEventName: res.locks[0].POAPEventName,
            tokenAddress: res.locks[0].tokenAddress,
            tokenChainId: res.locks[0].tokenChainId,
            tokenMin: res.locks[0].tokenMin,
            tokenName: res.locks[0].tokenName,
            tokenSymbol: res.locks[0].tokenSymbol,
          };
          setForm({ loading: false, step: 0, ...settings });
        }
        else {
          setForm({ loading: false, step: form.spaceDomain ? 2 : 1 });
        }
      });
  }, []);

  useEffect(() => {
    if (form.step !== -1) {
      GET('/track/page_view', {
        title: FORM_STEP_TITLES[form.step]
      });
    }
  }, [form.step]);


  function saveSettings (settings: Settings) {
    setForm({ saving: true });
    const gateSettings = {
      spaceDomain: settings.spaceDomain,
      spaceIcon: settings.spaceIcon,
      spaceId: settings.spaceId,
      spaceName: settings.spaceName,
    };
    const lockSettings = {
      lockType: settings.lockType,
      addressWhitelist: settings.addressWhitelist,
      POAPEventId: settings.POAPEventId,
      POAPEventName: settings.POAPEventName,
      spaceBlockIds: settings.spaceBlockIds,
      spaceBlockUrls: settings.spaceBlockUrls,
      spaceDefaultUrl: settings.spaceDefaultUrl,
      tokenAddress: settings.tokenAddress,
      tokenChainId: settings.tokenChainId,
      tokenMin: settings.tokenMin,
      tokenName: settings.tokenName,
      tokenSymbol: settings.tokenSymbol,
    };
    POST<Omit<NotionGateSettings, 'locks' | 'spaceIsAdmin'>>('/settings', gateSettings)
      .then (gate => {
        const req = form.lockId
          ? PUT<NotionGateSettings>('/settings/locks/' + form.lockId, lockSettings)
          : POST<NotionGateSettings>('/settings', { gateId: gate.id, ...lockSettings });
        req
          .then(settings => {
            setForm({ ...gate, ...settings, saving: false, step: 0 });
          })
          .catch(({ message }) => {
            setForm({ error: message, saving: false });
          });
      });
  }

  function goBack () {
    setForm({ step: form.step - 1 });
  }

  function updateFormAndContinue (_form: Partial<Form>) {
    setForm({ ..._form, step: form.step + 1 });
  }

  return (
    <Page title={'Notion Token Gate'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>
        <Card sx={{ width: '100%' }}>
          {form.step === 1 && (
            <NotionForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
          {form.step === 2 && (
            <NotionValidateForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
        </Card>
      </PageSection>
    </Page>
  );
}

function NotionForm ({ form, goBack, onSubmit }: { form: Settings, goBack: () => void, onSubmit: (form: Pick<Settings, 'spaceDomain' | 'spaceId'>) => void }) {
  const [spaceDomain, setSpace] = useState<string>(form.spaceDomain);

  function saveNotion () {
    if (spaceDomain) {
      const changed = spaceDomain !== form.spaceDomain;
      // set spaceId to '' so we refresh in the next step
      const spaceId = changed ? '' : form.spaceId;
      onSubmit({ spaceDomain, spaceId });
    }
  }

  function catchReturn (e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && spaceDomain) {
      saveNotion();
    }
  }

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
      {/* <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 1 of 4:</Typography> */}
      <Typography variant='h2' sx={{ fontSize: 18 }}>1. Enter your Notion workspace domain</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>
      <TextField
        defaultValue={form.spaceDomain}
        fullWidth
        required
        size='small'
        onKeyPress={catchReturn}
        helperText={<>
          Find your domain under <Link href='https://notion.so' target='_blank'>Workspace settings.</Link> A Team Plan is required.
        </>}
        InputProps={{
          placeholder: 'ourcommunity',
          startAdornment:(
            <InputAdornment position='start'>
              https://notion.so/
            </InputAdornment>
          )
        }}
        onChange={e => setSpace(e.target.value)}
      />
    </CardContent>
    <Divider />
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      {form.createdAt ?
        <Button variant='outlined' size='large' onClick={goBack}>
          Cancel
        </Button>
        : <div></div>
      }
      <PrimaryButton disabled={!spaceDomain} variant='outlined' size='large' onClick={saveNotion}>
        Continue
      </PrimaryButton>
    </CardContent>
  </>);
}


function NotionValidateForm ({ form, goBack, onSubmit }: { form: Settings, goBack: () => void, onSubmit: (form: Pick<Settings, 'spaceId' | 'spaceIsAdmin' | 'spaceDomain' | 'spaceIcon' | 'spaceName'>) => void }) {
  const [space, setSpace] = useLoadingState<{ error: string, value?: { spaceId: string, spaceIsAdmin: boolean, spaceIcon: string, spaceName: string, spaceDomain: string } | null }>({
    loading: true,
    error: '',
    value: (form.spaceId && form.spaceDomain)
      ? { spaceIcon: form.spaceIcon, spaceIsAdmin: form.spaceIsAdmin, spaceName: form.spaceName, spaceId: form.spaceId, spaceDomain: form.spaceDomain }
      : undefined
  });

  function getSpaceByDomain () {
    setSpace({ error: '', loading: true });
    GET<Space>('/notion/spaceByDomain', { domain: form.spaceDomain })
      .then(space => {
        if (space) {
          setSpace({ error: '', loading: false, value: { spaceIcon: space.icon, spaceIsAdmin: space.isAdmin, spaceName: space.name, spaceDomain: space.domain, spaceId: space.id} });
        }
        else {
          setSpace({ error: '', loading: false, value: null });
        }
      })
      .catch(({ message }: { message: string }) => {
        setSpace({ error: message, loading: false, value: null });
      });
  }

  function saveNotion () {
    if (space.value) {
      onSubmit(space.value);
    }
  }

  useEffect(() => {
    getSpaceByDomain();
  }, []);

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
    {/* <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 2 of 4:</Typography> */}
      <Typography variant='h2' sx={{ fontSize: 18 }}>2. Enable CharmVerse to manage users</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4, py: 2 }}>
      <Typography>
        Invite <strong>admin@charmverse.io</strong> to be an Admin of your <Link href='https://notion.so' target='_blank'>workspace</Link>.
      </Typography>
      <br />
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, mx: 'auto' }}>
        <NotionSpaceIcon src={space.value?.spaceIcon} />
      </Box>
      <Typography gutterBottom variant='h2' sx={{ fontSize: 16, mb: 2, textAlign: 'center' }}>{space.value?.spaceName || `https://notion.so/${form.spaceDomain}`}</Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={getSpaceByDomain}
          variant='outlined'
          color={(!space.loading && space.value) ? 'success' : 'secondary'}
          sx={{
            pointerEvents: (space.loading || space.value) ? 'none' : 'auto'
          }}
          endIcon={<InputLoadingIcon loading={space.loading} isValid={!!space.value} />}
        >
          {space.loading ? 'Checking' : space.value ? `Connected${space.value.spaceIsAdmin ? '' : ' as guest'}` : space.error ? 'Check again' : 'Click to check'}
        </Button>
        {space.error && <FormHelperText sx={{ textAlign: 'center' }} error>
          {space.error}
        </FormHelperText>}
        <TrimmedContent
          html={`We only leverage these the administrative privileges above to manage user and group access. We read and present Notion metadata as part of the services including your Notion ID, email, and electronic wallet address. We do not read or edit any content in your public or private workspace. No additional information will be collected from your workspace. We do not and will not sell Your data, individually or in aggregated form. See <a href='https://charmverse.io/privacy-policy' target='_blank'>Privacy Policy</a> for details.`}
          maxLength={25}
          sx={{ mt: 2, textAlign: 'left' }} />
      </Box>
    </CardContent>
    <Divider />
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Button variant='outlined' size='large' onClick={goBack}>
        Back
      </Button>
      <PrimaryButton disabled={!space.value} variant='outlined' size='large' onClick={saveNotion}>
        Continue
      </PrimaryButton>
    </CardContent>
  </>);
}

// from notional library
function toUUID (input: string) {
  return input.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
