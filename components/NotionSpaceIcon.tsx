import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import styled from '@emotion/styled';

const AvatarIcon = styled(Avatar)`
  width: 60px;
  height: 60px;
`;

const EmojiIcon = styled(Typography)`
  font-size: 60px;
  height: 60px;
  line-height: 60px;
`;

// icon can either be a URL or an emoji
export default function SpaceIcon ({ src }: { src: string }) {
  return ((!src || src.startsWith('http') || src.startsWith('/'))
        ? <AvatarIcon src={src} />
        : <EmojiIcon>{src}</EmojiIcon>
  );
}