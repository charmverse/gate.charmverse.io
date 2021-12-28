import { useState } from 'react';
import { fancyTrimWords } from '../lib/strings';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { blueColor } from '../theme/colors';

const TrimmedContent: React.FC<{ html: string, maxLength: number, sx: any }> = ({ html, maxLength, ...props }) => {

  const [expanded, setExpanded] = useState(html.length < maxLength);
  const trimmed = fancyTrimWords(html, maxLength);

  return (<Typography {...props}>
    <FormHelperText
      component='span'
      dangerouslySetInnerHTML={{ __html: expanded ? html: trimmed }}
    />
    {!expanded && (
      <FormHelperText component='span' sx={{ color: blueColor, cursor: 'pointer' }} onClick={() => setExpanded(true)}>&nbsp;Read More</FormHelperText>
    )}
    {/* {html.length > maxLength && expanded && (
      <FormHelperText component='span' sx={{ color: blueColor, cursor: 'pointer' }} onClick={() => setExpanded(false)}>&nbsp;Read Less</FormHelperText>
    )} */}
  </Typography>);
}

export default TrimmedContent;