
import Typography from '@mui/material/Typography';
import { buttonUnstyledClasses, Card, CardContent, CircularProgress, Divider, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { NotionGate } from '.prisma/client';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Button from '../components/Button';
import NotionSpaceIcon from '../components/NotionSpaceIcon';
import TrimmedContent from '../components/TrimmedContent';
import PrimaryButton from '../components/PrimaryButton';
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
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { useFormState, useLoadingState } from '../lib/react';
import { POST, GET, DELETE } from '../lib/http';
import Page, { PageSection } from '../layouts/Page';
import type { Settings } from './api/settings';
import BlockchainLogo from '../components/BlockchainLogo';
import { blockchains, getContractUrl } from '../lib/blockchain';
import styled from '@emotion/styled';


const tokenTypes = [
  { id: 'ERC20', name: 'ERC-20' },
  { id: 'ERC721', name: 'ERC-721' }
];

interface Space {
  domain: string;
  icon: string;
  id: string;
  isAdmin: boolean;
  name: string;
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
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    GET<Settings | null>('/api/settings')
      .then(res => {
        if (res) {
          setForm({ loading: false, step: 0, ...res });
        }
        else {
          setForm({ loading: false, step: form.spaceDomain ? 2 : 1 });
        }
      });
  }, []);

  useEffect(() => {
    GET<User[]>('/api/notion/getUsers')
      .then(_users => {
        setUsers(_users);
      });
  }, [form.spaceId]);

  useEffect(() => {
    if (form.step !== -1) {
      GET('/api/track/page_view', {
        title: FORM_STEP_TITLES[form.step]
      });
    }
  }, [form.step]);


  function saveSettings (settings: Omit<Settings, 'tokenName' | 'tokenSymbol'>) {
    setForm({ saving: true });
    POST<Settings>('/api/settings', settings)
      .then(settings => {
        setForm({ ...settings, saving: false, step: 0 });
      })
      .catch(({ error }) => {
        setForm({ error, saving: false });
      });
  }

  function goBack () {
    setForm({ step: form.step - 1 });
  }

  function editSettings () {
    setForm({ step: 1 });
  }

  function deleteSettings () {
    if (form.spaceDomain) {
      DELETE('/api/settings', { domain: form.spaceDomain })
        .then(() => {
          setForm({ saving: false, spaceDomain: '', step: 1 });
        });
    }
  }

  function updateFormAndContinue (_form: Partial<Form>) {
    setForm({ ..._form, step: form.step + 1 });
  }

  function saveToken (_form: Pick<Settings, 'tokenChainId' | 'tokenAddress' | 'tokenType' | 'tokenMin'>) {
    setForm(_form);
    saveSettings({
      spaceBlockIds: form.spaceBlockIds,
      spaceBlockUrls: form.spaceBlockUrls,
      spaceDefaultUrl: form.spaceDefaultUrl,
      spaceDomain: form.spaceDomain,
      spaceId: form.spaceId,
      spaceIcon: form.spaceIcon,
      spaceName: form.spaceName,
      tokenAddress: _form.tokenAddress,
      tokenChainId: _form.tokenChainId,
      tokenMin: _form.tokenMin,
      tokenType: _form.tokenType,
    });
  }

  const authorizedMembers = users.filter(user => !!user.address);
  const unauthorizedMembers = users.filter(user => !user.address);

  return (
    <Page title={'Notion Token Gate Settings'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>
        <Typography variant='h1' align='center'>Your Notion Token Gate</Typography>
        <br/><br/>
        <Card sx={{ width: '100%' }}>
          {form.step === -1 && (
            <CardContent sx={{ my: 10, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress style={{ color: '#ccc' }} />
            </CardContent>
          )}
          {form.step === 0 && (
            <SettingsDisplay settings={form} editSettings={editSettings} deleteSettings={deleteSettings} />
          )}
          {form.step === 1 && (
            <NotionForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
          {form.step === 2 && (
            <NotionValidateForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
          {form.step === 3 && (
            <NotionPreferencesForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
          {form.step === 4 && (
            <TokenForm form={form} goBack={goBack} onSubmit={saveToken} />
          )}
        </Card>
        {form.step !== -1 && (
          <FormHelperText sx={{ mt: 2, mb: 6, textAlign: 'center' }}>
            Questions or feature requests? Email <Link sx={{ color: 'inherit', fontWeight: 'bold' }} href='mailto:hello@charmverse.io'>hello@charmverse.io</Link>
          </FormHelperText>
        )}
        {form.step === 0 && (<Box sx={{ pb: 4 }}>
          <Typography variant='h2'>
            Authorized Members <Chip size='small' label={authorizedMembers.length} />
          </Typography>
          <br />
          <Grid container>
            {authorizedMembers.map(user => (
              <Grid component={Box} item xs key={user.id} display='flex' alignItems='center' justifyContent='flex-start' flexDirection='column'>
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
            <Grid container>
              {unauthorizedMembers.filter(user => !user.address).map(user => (
                <Grid component={Box} item xs key={user.id} display='flex' alignItems='center' justifyContent='flex-start' flexDirection='column'>
                  <Avatar src={user.icon} />
                </Grid>
              ))}
            </Grid>
          </>}
        </Box>)}
      </PageSection>
    </Page>
  );
}

function SettingsDisplay ({ settings, editSettings, deleteSettings }: { settings: Settings, editSettings: () => void, deleteSettings: () => void }) {

  const notionUrl = 'https://notion.so/' + settings.spaceDomain;
  const shareUrl = 'https://gate.charmverse.io/notion/' + settings.spaceDomain;
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
    <CardContent sx={{ px: 4, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

      <div>
        <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Notion Workspace</Typography>
        <Typography>
          <Link href={notionUrl} target='_blank'>{settings.spaceName}</Link>
        </Typography>
      </div>
      <div>
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
      </div>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4, pb: 2 }}>
{/*
      <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>
        Member Type: {settings.spaceBlockIds.length > 0 ? 'Guest' : 'Team Member'}
      </Typography>
      {settings.spaceDefaultUrl && (<>
        <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>
          Landing Page: <Link href={settings.spaceDefaultUrl} target='_blank'>{settings.spaceDefaultUrl}</Link>
        </Typography>
        <br />
      </>)} */}

      <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Access Criteria</Typography>
      <TokenAccessCriteria {...settings} />

      <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Share URL</Typography>
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
      </Box>

    </CardContent>
  </>);
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

  // const onDomainChange = debounce(function (event: React.ChangeEvent<HTMLInputElement>) {
  //   setSpaceId('');
  // }, 300);

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
      <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 1 of 4:</Typography>
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
    GET<Space>('/api/notion/spaceByDomain', { domain: form.spaceDomain })
      .then(space => {
        if (space) {
          setSpace({ error: '', loading: false, value: { spaceIcon: space.icon, spaceIsAdmin: space.isAdmin, spaceName: space.name, spaceDomain: space.domain, spaceId: space.id} });
        }
        else {
          setSpace({ error: '', loading: false, value: null });
        }
      })
      .catch(({ error }) => {
        setSpace({ error, loading: false, value: null });
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
    <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 2 of 4:</Typography>
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
          endIcon={
            space.loading ? <CircularProgress size={15} style={{ color: '#ccc' }} />
            : space.value ? <CheckIcon color='success' />
            : null
          }
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

const Tab = styled(TabUnstyled)`
  background-color: transparent;
  border: 0 none;

  opacity: .7;

  cursor: pointer;
  padding: 10px 15px;

  border: 1px solid #ccc;
  border-right: 0 none;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  &:last-of-type {
    border-right: 1px solid #ccc;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 50%;

  &:hover {
    opacity: 1;
  }

  &.${buttonUnstyledClasses.focusVisible} {
    color: #000;
    outline: none;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: #f7f7f7;
    border-color: #aaa;
    opacity: 1;
    font-weight: bold;
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabsList = styled(TabsListUnstyled)`
  background-color: white;
  border: 0 none;
  padding: 0;
  margin: 10px 0 20px;
  display: flex;
  align-content: space-between;
`;



function NotionPreferencesForm ({ form, goBack, onSubmit }: { form: Settings, goBack: () => void, onSubmit: (form: Pick<Settings, 'spaceBlockIds' | 'spaceBlockUrls' | 'spaceDefaultUrl'>) => void }) {

  const [spaceBlockIds, setSpaceBlockIds] = useState(form.spaceBlockIds);
  const [spaceBlockUrls, setSpaceBlockUrls] = useState<string>(form.spaceBlockUrls?.join('\n') || '');
  const [defaultUrl, setDefaultUrl] = useState(form.spaceDefaultUrl);
  const [memberType, setMemberType] = useState((form.spaceBlockIds.length > 0 || !form.spaceIsAdmin) ? 1 : 0);

  const [pages, setPages] = useState<{ id: string, name: string }[]>([{ id: 'a', name: 'test page' }]);

  function saveNotion () {
    onSubmit({
      spaceBlockIds: memberType === 1 ? spaceBlockIds : [],
      spaceBlockUrls: memberType === 1 ? spaceBlockUrls.split(/(\s+)/).filter(s => s.trim().length > 0) : [],
      spaceDefaultUrl: defaultUrl
    });
  }

  function changeMemberType (e: any, newValue: string | number) {
    setMemberType(newValue as number);
  }

  function changeBlockIds (e: SelectChangeEvent<string[]>) {
    setSpaceBlockIds(typeof e.target.value === 'string' ? [e.target.value] : e.target.value);
  }

  function changeBlockUrls (e: React.ChangeEvent<HTMLInputElement>) {
    setSpaceBlockUrls(e.target.value);
    const blockIds = e.target.value.split(/(\s+)/).filter(s => s.trim().length > 0).map(url => {
      const id = getBlockIdFromUrl(url);
      return id;
    });
    setSpaceBlockIds(blockIds);
  }


  function changeDefaultUrl (e: React.ChangeEvent<HTMLInputElement>) {
    setDefaultUrl(e.target.value);
  }

  // useEffect(() => {
  //   GET('/api/notion/getPages', { domain: form.spaceDomain }).then(res => {
  //     setPages(pages);
  //   });
  // })


  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
    <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 3 of 4:</Typography>
      <Typography  variant='h2' sx={{ fontSize: 18 }}>Configure Notion options</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>
      {form.spaceIsAdmin && (<FormLabel component='legend'>New Member Access Level</FormLabel>)}

      <TabsUnstyled value={memberType} onChange={changeMemberType}>
        {form.spaceIsAdmin && (
          <TabsList>
            <Tab>
              Team Member<br />
              <FormHelperText>Full Access</FormHelperText>
            </Tab>
            <Tab>
              Guest<br />
              <FormHelperText>Partial Access</FormHelperText>
            </Tab>
          </TabsList>
        )}
        <TabPanelUnstyled value={1}>

          <FormLabel component='legend'>Accessible Pages</FormLabel>

          <FormHelperText>Enter a space-separated list of pages to share with guests.</FormHelperText>
          <TextField
            fullWidth
            multiline
            value={spaceBlockUrls}
            onChange={changeBlockUrls}
            size='small'
            InputProps={{
              placeholder: 'https://ourcommunity.notion.so/welcome'
            }}
          />
          {/* <FormHelperText>Select pages to share with guests</FormHelperText>

          <FormControl sx={{ width: '100%' }}>
            <Select
              multiple
              size='small'
              value={spaceBlockIds}
              onChange={changeBlockIds}
            >
              {pages.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <br /><br />
        </TabPanelUnstyled>
      </TabsUnstyled>

      <FormLabel component='legend'>Landing Page</FormLabel>
      <FormHelperText>
        A default page that will be loaded when a user first visits your Notion workspace.
      </FormHelperText>
      <TextField
        fullWidth
        defaultValue={defaultUrl}
        onChange={changeDefaultUrl}
        size='small'
        InputProps={{
          placeholder: 'https://ourcommunity.notion.so/welcome'
        }}
      />
    </CardContent>
    <Divider />
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Button variant='outlined' size='large' onClick={goBack}>
        Back
      </Button>
      <PrimaryButton disabled={memberType === 1 && spaceBlockIds.length === 0} variant='outlined' size='large' onClick={saveNotion}>
        Continue
      </PrimaryButton>
    </CardContent>
  </>);
}

function TokenForm ({ form, goBack, onSubmit }: { form: Form, goBack: () => void, onSubmit: (form: Pick<Form, 'tokenChainId' | 'tokenAddress' | 'tokenType' | 'tokenMin'>) => void }) {

  const [values, setValues] = useFormState<Form>({
    // @ts-ignore
    tokenChainId: 1,
    // @ts-ignore
    tokenMin: 1,
    // @ts-ignore
    tokenType: 'ERC20',
    ...form
  });

  function saveToken () {
    onSubmit({
      ...values,
      // @ts-ignore cast string value to number
      tokenChainId: parseInt(values.tokenChainId, 10),
      tokenMin: typeof values.tokenMin === 'string' ? parseInt(values.tokenMin, 10) : values.tokenMin
    });
  }

  function updateValues (e: any) {
    const name = e.target.name;
    const value = e.target.value;
    setValues({ ...values, [name]: value });
  }

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
    <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 4 of 4:</Typography>
      <Typography  variant='h2' sx={{ fontSize: 18 }}>Enter Access Criteria</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>
      <FormLabel>Blockchain</FormLabel>
      <FormControl sx={{ width: '100%' }}>
        <Select
          size='small'
          name='tokenChainId'
          value={values.tokenChainId}
          onChange={updateValues}
        >
          {blockchains.map(option => (
            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <br /><br />
      <FormLabel>Token address</FormLabel>
      <TextField
        fullWidth
        name='tokenAddress'
        value={values.tokenAddress || ''}
        onChange={updateValues}
        required
        size='small'
        InputProps={{
          placeholder: '0x0000000000000000000000000000000000000000'
        }}
      />
      <br /><br />
      <FormLabel>Token type</FormLabel>
      <FormControl sx={{ width: '100%' }}>
        <Select
          size='small'
          name='tokenType'
          value={values.tokenType}
          onChange={updateValues}
        >
          {tokenTypes.map(option => (
            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <br /><br />
      <FormLabel>Minimum tokens in wallet</FormLabel>
      <TextField
        fullWidth
        name='tokenMin'
        onChange={updateValues}
        value={values.tokenMin}
        size='small'
        InputProps={{
          type: 'number',
          placeholder: '1'
        }}
      />
    </CardContent>
    <Divider />
    {form.error && (
      <CardContent sx={{ px: 4, pt: 2, pb: 0 }}>
        <Alert severity='error'>{form.error}</Alert>
      </CardContent>
    )}
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Button variant='outlined' size='large' onClick={goBack}>
        Back
      </Button>
      <PrimaryButton
        disabled={!values.tokenAddress || !values.tokenType || !values.tokenChainId}
        loading={form.saving}
        variant='outlined' size='large' onClick={saveToken}>
        {form.createdAt ? 'Save' : 'Create'}
      </PrimaryButton>
    </CardContent>
  </>);
}

export function TokenAccessCriteria ({ tokenChainId, tokenAddress, tokenMin, tokenName, tokenType, tokenSymbol }: Pick<NotionGate, 'tokenChainId' | 'tokenAddress' | 'tokenType' | 'tokenMin' | 'tokenName' | 'tokenSymbol'>) {
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

const shortenedContractAddresss = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};


 function getBlockIdFromUrl (url: string) {
  const parsed = new URL(url);
  const { pathname, searchParams } = parsed;
  // if we're looking at a popup
  if (searchParams.get('p')) {
    return toUUID(searchParams.get('p')!);
  }
  return toUUID(pathname.substring(pathname.length - 32));
}

// from notional library
function toUUID (input: string) {
  return input.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
