
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Copyright () {
  return (
    <Box my={5}>
      <Typography sx={{ fontSize: '10px' }} variant='body2' color='textSecondary' align='center'>
        {'Powered by '}
        <Link color='inherit' href='https://charmverse.io/' target='_blank'>
          CharmVerse
        </Link>
      </Typography>
    </Box>
  );
}