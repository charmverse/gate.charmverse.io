import React from 'react';
import Box from '@mui/material/Box';
import POAPSelect from '../../components/POAPSelect';

export default function () {
  const [value, setValue] = React.useState(19427);

  function onChange ({ id }: { id: number, name: string }) {
    setValue(id);
  }
  return (
    <Box padding={5}>
      <POAPSelect onChange={onChange} value={value} />
      <p>POAP Id: {value}</p>
    </Box>
  )
}