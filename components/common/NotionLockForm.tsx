
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { buttonUnstyledClasses, CardContent, Divider, FormHelperText, FormLabel, SelectChangeEvent } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabUnstyled, { tabUnstyledClasses } from '@mui/base/TabUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormState, useLoadingState } from '../../lib/react';
import { POST, GET, DELETE, PUT } from '../../lib/http/browser';
import { SUPPORTED_BLOCKCHAINS } from '../../lib/blockchain';
import debounce from '../../lib/debounce';
import Button from '../Button';
import PrimaryButton from '../PrimaryButton';
import InputLoadingIcon from '../InputLoadingIcon';
import POAPSelect from '../POAPSelect';
import { NotionGateLock } from '../../api';


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

interface Form extends NotionGateLock {
  step: number;
  error?: string;
  saving?: boolean;
}

interface User {
  id: string;
  icon: string;
  address?: string;
}

export default function NotionLockForm ({ gateId, hasAdminAccess, lock, goBack: goBackParent, onSubmit }: { gateId: string, hasAdminAccess: boolean, lock: Partial<NotionGateLock>, goBack?: () => void, onSubmit: (lock: NotionGateLock) => void }) {

  const [form, setForm] = useFormState<Form>({
    id: lock.id,
    // special notion properties
    spaceBlockIds: lock.spaceBlockIds || [],
    spaceBlockUrls: lock.spaceBlockUrls || [],
    spaceDefaultUrl: lock.spaceDefaultUrl,
    spaceUserRole: lock.spaceUserRole,
    // requirements
    lockType: lock.lockType || 'ERC20',
    addressWhitelist: lock.addressWhitelist || [],
    tokenAddress: lock.tokenAddress,
    tokenBlacklist: lock.tokenBlacklist || [],
    tokenChainId: lock.tokenChainId || 1,
    tokenName: lock.tokenName,
    tokenSymbol: lock.tokenSymbol,
    tokenMin: lock.tokenMin || 1,
    POAPEventId: lock.POAPEventId,
    POAPEventName: lock.POAPEventName,
    step: 1
  });


  function saveNotionForm (_form: NotionFormFields) {
    setForm({ ..._form, saving: true });
    const lockSettings = {
      spaceBlockIds: _form.spaceBlockIds,
      spaceBlockUrls: _form.spaceBlockUrls,
      spaceDefaultUrl: _form.spaceDefaultUrl,
      spaceUserRole: _form.spaceUserRole,
      lockType: form.lockType,
      addressWhitelist: form.addressWhitelist,
      POAPEventId: form.POAPEventId,
      POAPEventName: form.POAPEventName,
      tokenAddress: form.tokenAddress,
      tokenBlacklist: form.tokenBlacklist,
      tokenChainId: form.tokenChainId,
      tokenMin: form.tokenMin,
      tokenName: form.tokenName,
      tokenSymbol: form.tokenSymbol,
    };
    const req = form.id
      ? PUT<NotionGateLock>('/settings/locks/' + form.id, lockSettings)
      : POST<NotionGateLock>('/settings/locks', { gateId, ...lockSettings });
    req
      .then(settings => {
        onSubmit(settings);
      })
      .catch(({ message }) => {
        setForm({ error: message, saving: false });
      });
  }

  function goBack () {
    setForm({ step: 1 });
  }

  function saveTokenForm (_form: TokenFormFields) {
    setForm({ ..._form, step: 2 });
  }

  return (
    <>
      {form.step === 1 && (
        <TokenForm form={form} goBack={goBackParent} onSubmit={saveTokenForm} />
      )}
      {form.step === 2 && (
        <NotionPreferencesForm form={form} hasAdminAccess={hasAdminAccess} goBack={goBack} onSubmit={saveNotionForm} />
      )}
    </>
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



type NotionFormFields = Pick<NotionGateLock, 'spaceBlockIds' | 'spaceBlockUrls' | 'spaceDefaultUrl' | 'spaceUserRole'>;

function NotionPreferencesForm ({ form, hasAdminAccess, goBack, onSubmit }: { form: NotionGateLock, hasAdminAccess: boolean, goBack?: () => void, onSubmit: (form: NotionFormFields) => void }) {

  const [spaceBlockIds, setSpaceBlockIds] = useState(form.spaceBlockIds);
  const [spaceBlockUrls, setSpaceBlockUrls] = useState<string>(form.spaceBlockUrls?.join('\n') || '');
  const [userRole, setUserRole] = useState(form.spaceUserRole || 'read_and_write');
  const [defaultUrl, setDefaultUrl] = useState(form.spaceDefaultUrl);
  const [memberType, setMemberType] = useState((form.spaceBlockIds.length > 0 || !hasAdminAccess) ? 1 : 0);

  const [pages, setPages] = useState<{ id: string, name: string }[]>([{ id: 'a', name: 'test page' }]);

  function saveNotion () {
    onSubmit({
      spaceBlockIds: memberType === 1 ? spaceBlockIds : [],
      spaceBlockUrls: memberType === 1 ? spaceBlockUrls.split(/(\s+)/).filter(s => s.trim().length > 0) : [],
      spaceDefaultUrl: defaultUrl,
      spaceUserRole: memberType === 1 ? userRole : null
    });
  }

  function changeMemberType (e: any, newValue: string | number) {
    setMemberType(newValue as number);
  }

  function changeUserRole (e: any, newValue: string) {
    console.log('new value', newValue);
    setUserRole(newValue as NotionGateLock['spaceUserRole']);
  }

  function changeBlockIds (e: SelectChangeEvent<string[]>) {
    setSpaceBlockIds(typeof e.target.value === 'string' ? [e.target.value] : e.target.value);
  }

  function changeBlockUrls (e: React.ChangeEvent<HTMLInputElement>) {
    setSpaceBlockUrls(e.target.value);
    const blockIds = e.target.value.split(/(\s+)/).filter(s => s.trim().length > 0).map(url => {
      const id = getBlockIdFromUrl(url);
      return id;
    }).flat();
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
      <Typography variant='h2' sx={{ fontSize: 18 }}>Configure Notion options</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>
      {hasAdminAccess && (<FormLabel component='legend'>New Member Access Level</FormLabel>)}

      <TabsUnstyled value={memberType} onChange={changeMemberType}>
        {hasAdminAccess && (
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

          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <FormLabel component='legend'>Editor Access</FormLabel>
            <ToggleButtonGroup
              size='small'
              value={userRole}
              exclusive
              onChange={changeUserRole}
            >
              <ToggleButton disableRipple sx={{ px: 2 }} value='read_and_write'>Can edit</ToggleButton>
              <ToggleButton disableRipple sx={{ px: 2 }} value='reader'>View only</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <br />

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
      {goBack
        ? <Button variant='outlined' size='large' onClick={goBack}>
          Back
        </Button>
        : <div></div>
      }
      <PrimaryButton disabled={memberType === 1 && spaceBlockIds.length === 0} variant='outlined' size='large' onClick={saveNotion}>
        {form.id ? 'Save' : 'Create'}
      </PrimaryButton>
    </CardContent>
  </>);
}

type TokenFormFields = Pick<NotionGateLock, 'addressWhitelist' | 'POAPEventName' | 'POAPEventId' | 'tokenChainId' | 'tokenAddress' | 'tokenBlacklist' | 'tokenName' | 'tokenSymbol' | 'lockType' | 'tokenMin'>;

function TokenForm ({ form, goBack, onSubmit }: { form: Form, goBack?: () => void, onSubmit: (form: TokenFormFields) => void }) {

  const [isValidContract, setIsValidContract] = useLoadingState<{ loading: boolean, valid: boolean }>({ loading: false, valid: false });
  const [values, setValues] = useFormState<Form & { tokenBlacklistStr: string }>({
    tokenName: '',
    tokenSymbol: '',
    tokenChainId: 1,
    tokenMin: 1,
    lockType: 'ERC20',
    ...form,
    tokenBlacklistStr: form.tokenBlacklist.join('\n'),
  });

  function submitForm () {
    onSubmit({
      ...values,
      tokenBlacklist: values.tokenBlacklistStr.split(/(\s+)/).filter(s => s.trim().length > 0),
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

  const onContractChange = debounce(function (_values: TokenFormFields) {
    if (!_values.tokenAddress) {
      return;
    }
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
      <Typography  variant='h2' sx={{ fontSize: 18 }}>Enter Access Criteria</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ p: 4 }}>

      <FormLabel>Chain</FormLabel>
      {values.lockType === 'POAP' && <>
        <Typography>Works on both ETHEREUM and XDAI</Typography>
        <Divider sx={{ my: 2 }} />
      </>}
      {values.lockType !== 'POAP' && (<>
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
        {(values.lockType === 'ERC721') && (<>
          <br /><br />
          <FormLabel>Token id blacklist</FormLabel>
          <TextField
            fullWidth
            multiline
            name='tokenBlacklistStr'
            onChange={updateValues}
            value={values.tokenBlacklistStr}
            size='small'
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
      {goBack ? <Button variant='outlined' size='large' onClick={goBack}>
        Back
      </Button> : <div></div>}
      <PrimaryButton
        disabled={(values.lockType === 'POAP' ? !values.POAPEventId : (!values.tokenAddress || !values.lockType || !values.tokenChainId))}
        loading={form.saving}
        variant='outlined' size='large' onClick={submitForm}>
        Continue
      </PrimaryButton>
    </CardContent>
  </>);
}

const shortenedContractAddresss = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};


 function getBlockIdFromUrl (url: string) {
   try {
    const parsed = new URL(url);
    const { pathname, searchParams } = parsed;
    // if we're looking at a popup
    if (searchParams.get('p')) {
      return toUUID(searchParams.get('p')!);
    }
    return toUUID(pathname.substring(pathname.length - 32));
  }
  catch (e) {
    return null;
  }
}

// from notional library
function toUUID (input: string) {
  return input.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
