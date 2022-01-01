import { useEffect } from 'react';
import styled from '@emotion/styled';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountIcon from '@mui/icons-material/AccountBox';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import { useUser } from '@auth0/nextjs-auth0';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from './Link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { backgroundBlack, blueColor } from '../theme/colors';
import { useRouter } from 'next/router';

const StyledLink = styled(Link)<{ active: boolean }>`
  border-bottom: 1px solid transparent;
  color: white;
  font-size: .8rem;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  margin-left: 1.5em;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1rem;
    letter-spacing: .05em;
    margin-left: 3em;
  }
  ${({ active }) => active && `
    border-bottom: 1px solid ${blueColor};
  }`}
`;

const LoginButton = styled(StyledLink)`
  border-radius: 24px;
  border: 1px solid ${blueColor};
  padding: .5em 1em;
`;

const NavigationContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  img {
    border-radius: 50%;
    width: 50px;
    height: 50px;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: block;
    img {
      width: 100px;
      height: 100px;
    }
  }
`;

const StyledAvatar = styled(Avatar)`
  border: 1px solid #eee;
`;

const StyledMenu = styled(Menu)`
  .MuiPaper-root {
  }
`;

const StyledMenuItem = styled(MenuItem)`
  min-width: 150px;
` as any;

const StyledListItemText = styled(ListItemText)`
  font-weight: bold;
`;

export default function Navigation ({ className, hideLogo, isLandingPage }: { className?: string, hideLogo?: boolean, isLandingPage?: boolean }) {
  const router = useRouter();
  return (
    <NavigationContainer className={className}>
      <Logo>
        <img src='/images/logo_black_lightgrey.png' />
      </Logo>

      <Box sx={{ position: 'absolute', top: '1em', right: '1em' }}>
        <UserMenu />
      </Box>
    </NavigationContainer>
  );
}

function UserMenu () {
  const { user } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);
  const [redirectPath, setRedirectPath] = useState('');
  const router = useRouter();
  const open = Boolean(anchorEl);
  useEffect(() => {
    setRedirectPath(window.location.pathname);
  }, []);

  let timeout: NodeJS.Timeout;

  const handleClick = (event: any) => {
    clearTimeout(timeout);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    clearTimeout(timeout);
    setAnchorEl(null);
  };

  if (user) {
    return (<>
      <IconButton onClick={handleClick} style={{ padding: 0 }}>
        <StyledAvatar src={user?.picture || undefined} />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        disableScrollLock={true}
        open={open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClick={handleClose}
        onClose={handleClose}
      >
        {/* <StyledMenuItem component={Link} href='/account'>
          <ListItemIcon style={{ color:'grey' }}><AccountIcon /></ListItemIcon>
          <StyledListItemText disableTypography primary='Profile' />
        </StyledMenuItem>
        <StyledMenuItem component={Link} href='/account/settings'>
          <ListItemIcon style={{ color:'grey' }}><SettingsIcon /></ListItemIcon>
          <StyledListItemText disableTypography primary='Settings' />
        </StyledMenuItem>
        <Divider /> */}
        <StyledMenuItem component='a' href='/api/auth/logout'>
          <ListItemIcon style={{ color:'grey' }}><LogoutIcon /></ListItemIcon>
          <StyledListItemText disableTypography primary='Logout' />
        </StyledMenuItem>
      </StyledMenu>
    </>);
  }
  else {
    return (
      <LoginButton active={false} color='primary' href={'/api/auth/login?returnTo=' + encodeURIComponent(redirectPath)} external={true}>
        Login
      </LoginButton>
    );
  }
}

export const HomepagePrimaryNavigation = styled((props: any) => <Navigation {...props} hideLogo isLandingPage />)`
  position: relative;
  z-index: 1;
`;
