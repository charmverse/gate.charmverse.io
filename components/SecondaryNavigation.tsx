import styled from '@emotion/styled';
import Link from './Link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DiscordIcon from '../public/images/discord_logo.svg';
import SvgIcon from '@mui/material/SvgIcon';

const StyledBox = styled(Box)`
  font-size: .8em;
  width: 100%;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
  ${props => props.theme.breakpoints.up('md')} {
    font-size: .9em;
    width: 40em;
  }
`;

const MenuLink: React.FC<{ href: string, target?: string }> = ({ href, target, children }) => (
  <Link color='white' href={href} sx={{ mx: { xs: 1, sm: 2 } }} external target={target}>{children}</Link>
);

export default function Navigation () {
  return (
    <StyledBox py={4}>
      <Box my={3} sx={{ textAlign: 'center', borderBottom: '1px solid rgb(200, 200, 200, .25)', paddingBottom: '1em' }}>
        <IconButton sx={{ mx: 1 }} color='white' href='https://www.linkedin.com/company/charmverse' target='_blank'>
          <LinkedInIcon />
        </IconButton>
        <IconButton sx={{ mx: 1 }} color='white' href='https://twitter.com/charmverse' target='_blank'>
          <TwitterIcon />
        </IconButton>
        <IconButton sx={{ mx: 1 }} color='white' href='https://www.facebook.com/charmverse.io' target='_blank'>
          <FacebookIcon />
        </IconButton>
        <IconButton sx={{ mx: 1 }} color='white' href='https://discord.gg/UEsngsk8E2' target='_blank'>
          <SvgIcon viewBox='0 -5 70 70'><DiscordIcon style={{ fill: '#fff' }} /></SvgIcon>
        </IconButton>
        <IconButton sx={{ mx: 1 }} color='white' href='mailto:hello@charmverse.io' target='_blank'>
          <MailIcon />
        </IconButton>
      </Box>
      <Box my={3} sx={{ textAlign: 'center' }}>
        <MenuLink href='https://charmverse.zendesk.com' target='_blank'>FAQ</MenuLink>
        <MenuLink href='https://charmverse.io/privacy-policy'>Privacy Policy</MenuLink>
      </Box>
    </StyledBox>
  );
}
