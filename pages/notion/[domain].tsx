import { Card, CardContent, CircularProgress, Divider } from '@mui/material';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '../../components/Button';
import LoadingComponent from '../../components/LoadingComponent';
import Copyright from '../../components/Copyright';
import PrimaryButton from '../../components/PrimaryButton';
import NotionSpaceIcon from '../../components/NotionSpaceIcon';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LockIcon from '@mui/icons-material/LockOpen';
import CheckIcon from '@mui/icons-material/Check';
import SwapHorizIcon from '@mui/icons-material/ArrowRightAlt';
import { PageSection } from '../../layouts/Page';
import styled from '@emotion/styled';
import { useLoadingState } from '../../lib/react';
import { POST, GET } from '../../lib/http/browser';
import { GET as serverGET } from '../../lib/http/server';
import debounce from '../../lib/debounce';
import WalletConnectButton from '../../components/WalletConnectButton';
import BlockchainLogo from '../../components/BlockchainLogo';
import { getCookie, setCookie } from '../../lib/browser';

import TokenAccessCriteria from '../../components/TokenAccessCriteria';
import { blueColor } from '../../theme/colors';
import { useRouter } from 'next/router';
import { NotionGateLock } from '../../api';
import { GetServerSidePropsContext } from 'next';

const Logo = styled.img`
  border-radius: 50%;
  height: 62px;
  width: 64px;
  display: inline;
  margin: 0 .5em;
  vertical-align: middle;
`;

const LockContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
`;

const EMAIL_COOKIE = 'notion_email';

interface Gate {
  spaceDomain: string;
  spaceName: string;
  spaceIcon?: string;
  spaceDefaultUrl?: string;
  locks: Pick<NotionGateLock, 'POAPEventName' | 'tokenChainId' | 'tokenAddress' | 'lockType' | 'tokenMin' | 'tokenName' | 'tokenSymbol'>[];
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  console.log(ctx.req.url);
  const domain = ctx.req.url.split('/').pop();
  console.log('domain', domain)
  const { gate } = await serverGET(process.env.NEXT_PUBLIC_API + `/gate`, { domain });
  if (!gate) {
    return {
      notFound: true
    };
  }
  console.log('gate', gate);
  return {
    props: {
      gate
    }
  };
};

export default function TokenGate ({ gate }: { gate: any }) {

  const [activeLock, setActiveLock] = useState<NotionGateLock>(gate.locks[0]);
  const emailFromCookie = getCookie(EMAIL_COOKIE);
  const [saving, setSaving] = useState(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [accountChainId, setAccountChainId] = useState<number | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [walletState, setWalletState] = useLoadingState<{ address?: string, approved: boolean, connected: boolean, signature?: string, error: string }>({ approved: false, connected: false, loading: false, error: '' });
  const [emailState, setEmailState] = useLoadingState<{ valid?: boolean, email?: string, notionUserId?: string }>({ email: emailFromCookie, loading: false });

  const { spaceDomain, spaceName, spaceIcon } = (gate || {});

  useEffect(() => {
    if (activeLock && accountAddress && accountChainId) {
      setWalletState({ address: accountAddress, loading: true, approved: false, connected: false, error: '' });
      GET<{ approved: boolean, connected: boolean, error?: string }>('/notion/connect', {
        address: accountAddress,
        chainId: accountChainId,
        domain: spaceDomain,
        lockId: activeLock.id,
      }).then(({ approved, connected, error }) => {
        setWalletState({ loading: false, approved, connected, error: error || '' });
      });
    }
    else {
      setWalletState({ address: '', loading: false, approved: false, connected: false, error: '' });
    }
  }, [accountAddress, accountChainId, activeLock]);

  useEffect(() => {
    // check email on page load if we have a cookie
    if (emailFromCookie) {
      checkEmail(emailFromCookie);
    }
  }, [emailFromCookie]);

  function connectWallet (account: { address: string, chainId: number, signature?: string }) {
    setAccountAddress(account.address);
    setAccountChainId(account.chainId);
    setSignature(account.signature || null);
  }

  const onEmailChange = debounce(function (event: React.ChangeEvent<HTMLInputElement>) {
    const email = event.target.value;
    checkEmail(email);
  }, 300);

  function checkEmail (email: string) {
    setCookie(EMAIL_COOKIE, email);
    if (!email) {
      setEmailState({ email, notionUserId: undefined, valid: false });
      return;
    }
    setEmailState({ loading: true });
    GET<{ userId: string }>('/notion/userByEmail', { email })
      .then(({ userId }) => {
        if (userId) {
          setEmailState({ loading: false, email, valid: true, notionUserId: userId });
        }
        else {
          setEmailState({ loading: false, email, valid: true, notionUserId: undefined });
        }
      })
      .catch(err => {
        setEmailState({ loading: false, email, valid: false, notionUserId: undefined });
      })
  }

  function saveConnection () {
    if (emailState.notionUserId) {
      setSaving(true);
      POST('/notion/connect', {
        address: accountAddress,
        chainId: accountChainId,
        domain: spaceDomain,
        email: emailState.email,
        lockId: activeLock.id,
        notionUserId: emailState.notionUserId,
        signature,
      }).then(connectState => {
        setSaving(false);
        setWalletState({ connected: true });
        window.location.href = notionLandingPage;
      })
      .catch(err => {
        setSaving(false);
      });
    }
  }

  function onSelectLock (lock: NotionGateLock) {
    setActiveLock(lock);
    console.log('set active', lock);
  }

  const allowSelectCriteria = !!(gate.locks.length > 1);

  const workspaceUrl = `https://notion.so/${spaceDomain}`;
  const notionLandingPage = gate.spaceDefaultUrl || workspaceUrl;

  return (
    <>
      <Head>
        <title>Join the {spaceName} Notion workspace | CharmVerse Token Gate</title>
      </Head>
      <Box sx={{ background: 'white', py: 5 }}>
        <Box pb={3}  display='flex' alignItems='center' justifyContent='center'>
          <LockContainer style={{ border: '1px solid #ccc', marginRight: '.5em' }}>
            <BlockchainLogo chainId={gate.locks[0].tokenChainId} width={36} />
          </LockContainer>
          <SwapHorizIcon sx={{ color: '#aaa' }} />
          <LockContainer style={{ background: blueColor, color: 'white', height: '48px', width: '48px', margin: '0 .5em' }}>
            <LockIcon />
          </LockContainer>
          <SwapHorizIcon sx={{ color: '#aaa' }} />
          <NotionSpaceIcon src={spaceIcon || '/images/notion.64.png'} />
        </Box>
        <Typography gutterBottom align='center' variant='h2' sx={{ fontSize: 18 }}>
          Unlock the <Link href={workspaceUrl} target='_blank'>{spaceName}</Link> Notion workspace
        </Typography>
      </Box>
      <PageSection sx={{ minHeight: 500 }} width={570}>
        <Box my={5}>
          <Typography sx={{ fontSize: 12 }}>
            CharmVerse grants access to this Notion workspace by associating your Notion account with your crypto wallet. Your wallet must meet the criteria below.
          </Typography>
          <br />
          <Typography gutterBottom sx={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)' }}>
            {allowSelectCriteria ? 'Select an ' : ''}Access Criteria:
          </Typography>
            {gate.locks.map((lock, i) => (
              <div key={i}>
                <TokenAccessCriteria {...lock} onClick={() => onSelectLock(lock)} selected={activeLock === lock} selectable={allowSelectCriteria} />
                {i < gate.locks.length - 1 && <Box display='flex' justifyContent='center' mb={1}>or</Box>}
              </div>
            ))}
        </Box>
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ my: 'auto', mb: 2 }}>
              <Typography gutterBottom variant='h2' sx={{ fontSize: 18, mb: 2 }}>Step 1. Enter the email address of your Notion account</Typography>
              <TextField
                autoFocus
                color={emailState.notionUserId ? 'success' : 'secondary'}
                defaultValue={emailState.email}
                fullWidth
                size='small'
                error={!!emailState.error}
                helperText={(emailState.email && !emailState.valid) ? 'Enter a valid email'
                  : (!emailState.email || !emailState.notionUserId) ? <>Don't have a Notion account? <Link href='https://www.notion.so/signup' target='_blank'>Create an account now</Link></>
                  : 'User found'}
                InputProps={{
                  type: 'email',
                  placeholder: 'vitalik@ourcommunity.xyz',
                  endAdornment: emailState.loading ?
                    (
                      <InputAdornment position="end">
                        <CircularProgress size={20} style={{ color: '#ccc' }} />
                      </InputAdornment>
                    ) : (emailState.notionUserId ?
                    (
                      <InputAdornment position="end">
                        <CheckIcon color='success' />
                      </InputAdornment>
                    ) : null)
                }}
                onChange={onEmailChange}
              />
              {(emailState.notionUserId || walletState.address) && <>
                <Typography gutterBottom variant='h2' sx={{ fontSize: 18, my: 2 }}>Step 2. Connect to a wallet</Typography>
                <WalletConnectButton email={emailState.email} userId={emailState.notionUserId} chainId={activeLock.tokenChainId} connect={connectWallet} walletState={walletState} />
              </>}
            </Box>
          </CardContent>


          {accountAddress && emailState.notionUserId && walletState.approved && <>
            <Divider />

            <CardContent sx={{ p: 2 }}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                {walletState.connected
                  ? (
                    <Button
                      href={notionLandingPage} variant='outlined' size='large'
                    >
                      Continue to Notion
                    </Button>
                  ) : (
                    <PrimaryButton
                      loading={saving}
                      variant='outlined' size='large'
                      onClick={saveConnection}
                    >
                      Join
                    </PrimaryButton>
                  )
                }
              </Box>
            </CardContent>
          </>}
        </Card>
        <Copyright />
      </PageSection>
    </>
  );
}
