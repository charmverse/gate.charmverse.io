
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { CardContent, Divider, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormState, useLoadingState } from '../../lib/react';
import { POST, GET } from '../../lib/http/browser';
import Button from '../Button';
import NotionSpaceIcon from '../NotionSpaceIcon';
import TrimmedContent from '../TrimmedContent';
import PrimaryButton from '../PrimaryButton';
import InputLoadingIcon from '../InputLoadingIcon';
import { NotionGateSettings } from '../../api';


interface Space {
  domain: string;
  icon: string;
  id: string;
  isAdmin: boolean;
  name: string;
}


interface Form extends NotionGateSettings {
  step: number;
  error?: string;
  saving?: boolean;
}

interface User {
  id: string;
  icon: string;
  address?: string;
}


export default function NotionGateForm ({ gate, onSubmit }: { gate?: NotionGateSettings, onSubmit: (settings: NotionGateSettings) => void }) {

  const [form, setForm] = useFormState<Form>({
    spaceDomain: gate?.spaceDomain,
    spaceIcon: gate?.spaceIcon,
    spaceId: gate?.spaceId,
    spaceName: gate?.spaceName,
    step: 1
  });

  // useEffect(() => {
  //   if (form.step !== -1) {
  //     GET('/track/page_view', {
  //       title: FORM_STEP_TITLES[form.step]
  //     });
  //   }
  // }, [form.step]);


  function goBack () {
    setForm({ step: 1 });
  }

  function setDomain (_form: DomainFormFields) {
    setForm({ ..._form, step: 2 });
  }

  function saveSettings (_form: FormFields) {
    setForm({ ..._form, saving: true });
    const gateSettings = {
      spaceDomain: _form.spaceDomain,
      spaceIcon: _form.spaceIcon,
      spaceId: _form.spaceId,
      spaceName: _form.spaceName,
    };
    POST<NotionGateSettings>('/settings', gateSettings)
      .then (gate => {
        onSubmit(gate);
      })
      .catch(({ message }) => {
        setForm({ error: message, saving: false });
      });;
  }

  return (<>
      {form.step === 1 && (
        <DomainForm form={form} goBack={goBack} onSubmit={setDomain} />
      )}
      {form.step === 2 && (
        <ValidateAccessForm form={form} goBack={goBack} onSubmit={saveSettings} />
      )}
    </>
  );
}

type DomainFormFields = Pick<NotionGateSettings, 'spaceDomain' | 'spaceId'>;

function DomainForm ({ form, goBack, onSubmit }: { form: NotionGateSettings, goBack: () => void, onSubmit: (form: DomainFormFields) => void }) {
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
      <Typography variant='h2' sx={{ fontSize: 18 }}>Enter your Notion workspace domain</Typography>
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

type FormFields = Pick<NotionGateSettings, 'spaceId' | 'spaceIsAdmin' | 'spaceDomain' | 'spaceIcon' | 'spaceName'>;

function ValidateAccessForm ({ form, goBack, onSubmit }: { form: NotionGateSettings, goBack: () => void, onSubmit: (form: FormFields) => void }) {
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
      <Typography variant='h2' sx={{ fontSize: 18 }}>Enable CharmVerse to manage users</Typography>
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
        Save
      </PrimaryButton>
    </CardContent>
  </>);
}
