
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
import { LockType, NotionGateSettings } from '../../api';


const lockTypes = [
  { id: 'ERC20', name: 'ERC-20' },
  { id: 'ERC721', name: 'ERC-721' },
  { id: 'POAP', name: 'POAP' }
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

  function saveForm (_form: TokenFormSettings) {
    setForm(_form);
    saveSettings({
      lockId: form.lockId,
      addressWhitelist: form.addressWhitelist,
      POAPEventId: _form.POAPEventId,
      POAPEventName: _form.POAPEventName,
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
      lockType: _form.lockType,
      tokenName: _form.tokenName,
      tokenSymbol: _form.tokenSymbol,
    });
  }

  return (
    <Page title={'Notion Token Gate'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>
        <Card sx={{ width: '100%' }}>
          {form.step === 3 && (
            <NotionPreferencesForm form={form} goBack={goBack} onSubmit={updateFormAndContinue} />
          )}
          {form.step === 4 && (
            <TokenForm form={form} goBack={goBack} onSubmit={saveForm} />
          )}
        </Card>
      </PageSection>
    </Page>
  );
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
  //   GET('/notion/getPages', { domain: form.spaceDomain }).then(res => {
  //     setPages(pages);
  //   });
  // })


  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
    <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 3 of 4:</Typography>
      <Typography variant='h2' sx={{ fontSize: 18 }}>Configure Notion options</Typography>
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

type TokenFormSettings = Pick<Settings, 'POAPEventName' | 'POAPEventId' | 'tokenChainId' | 'tokenAddress' | 'tokenName' | 'tokenSymbol' | 'lockType' | 'tokenMin'>;

function TokenForm ({ form, goBack, onSubmit }: { form: Form, goBack: () => void, onSubmit: (form: TokenFormSettings) => void }) {

  const [isValidContract, setIsValidContract] = useLoadingState({ valid: false });
  const [values, setValues] = useFormState<Form>({
    tokenName: '',
    tokenSymbol: '',
    tokenChainId: 1,
    tokenMin: 1,
    lockType: 'ERC20',
    ...form
  });

  function submitForm () {
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
    setValues({ [name]: value });
    if (name === 'tokenChainId' || name === 'tokenAddress' || name === 'lockType') {
      onContractChange({ ...values, [name]: value });
    }
  }

  const onContractChange = debounce(function (_values: TokenFormSettings) {
    setIsValidContract({ loading: true });
    GET<{ tokenName: string, tokenSymbol: string }>('/blockchain/getContract', {
      tokenAddress: _values.tokenAddress,
      tokenChainId: _values.tokenChainId
    }).then(res => {
      const tokenName = res.tokenName || _values.tokenName;
      const tokenSymbol = res.tokenSymbol || _values.tokenSymbol;
      setValues({ tokenName, tokenSymbol, error: null });
      setIsValidContract({ loading: false, valid: true });
    }).catch(err => {
      setValues({ error: 'Please enter a valid contract' });
      setIsValidContract({ loading: false, valid: false });
    });
  }, 300);

  useEffect(() => {
    if (values.tokenAddress) {
      onContractChange(values);
    }
  }, []);

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
    <Typography gutterBottom variant='h2' sx={{ fontSize: 14 }}>Step 4 of 4:</Typography>
      <Typography  variant='h2' sx={{ fontSize: 18 }}>Enter Access Criteria</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>
      <FormLabel>Token type</FormLabel>
      <FormControl sx={{ width: '100%' }}>
        <Select
          size='small'
          name='lockType'
          value={values.lockType}
          onChange={updateValues}
        >
          {lockTypes.map(option => (
            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <br /><br />

      {values.lockType !== 'POAP' && (<>
        <FormLabel>Blockchain</FormLabel>
        <FormControl sx={{ width: '100%' }}>
          <Select
            size='small'
            name='tokenChainId'
            value={values.tokenChainId}
            onChange={updateValues}
          >
            {SUPPORTED_BLOCKCHAINS.map(option => (
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
            endAdornment: (
              <InputAdornment position='end'>
                <InputLoadingIcon loading={isValidContract.loading} isValid={isValidContract.valid} />
              </InputAdornment>
            ),
            placeholder: '0x0000000000000000000000000000000000000000'
          }}
        />
        <br /><br />
        <FormLabel>Token name</FormLabel>
        {values.lockType === 'ERC721' ? (
          <TextField
            fullWidth
            name='tokenName'
            value={values.tokenName || ''}
            onChange={updateValues}
            required
            size='small'
          />
        ) : (
          <TextField
            fullWidth
            name='tokenSymbol'
            value={values.tokenSymbol || ''}
            onChange={updateValues}
            required
            size='small'
          />
        )}
        {(values.lockType === 'ERC20' || values.lockType === 'ERC721') && (<>
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
        </>)}
      </>)}
      {values.lockType === 'POAP' && (<>
        <FormLabel>POAP</FormLabel>
        <FormControl sx={{ width: '100%' }}>
          <POAPSelect value={values.POAPEventId} onChange={({ id, name }) => setValues({ POAPEventId: id, POAPEventName: name })} />
        </FormControl>
        </>)}
    </CardContent>
    <Divider />
    {values.error && (
      <CardContent sx={{ px: 4, pt: 2, pb: 0 }}>
        <Alert severity='error'>{values.error}</Alert>
      </CardContent>
    )}
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Button variant='outlined' size='large' onClick={goBack}>
        Back
      </Button>
      <PrimaryButton
        disabled={(values.lockType === 'POAP' ? !values.POAPEventId : (!values.tokenAddress || !values.lockType || !values.tokenChainId))}
        loading={form.saving}
        variant='outlined' size='large' onClick={submitForm}>
        {form.createdAt ? 'Save' : 'Create'}
      </PrimaryButton>
    </CardContent>
  </>);
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
