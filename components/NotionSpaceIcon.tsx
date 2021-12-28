import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

// icon can either be a URL or an emoji
export default function SpaceIcon ({ src }: { src: string }) {
  return ((!src || src.includes('http'))
        ? <Avatar src={src} sx={{ width: 60, height: 60 }} />
        : <Typography sx={{ fontSize: 60 }}>{src}</Typography>
  );
}