import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';

export default function LoadingIcon ({ loading, isValid }: { loading: boolean, isValid?: any }) {
  return (
    loading ? <CircularProgress size={15} style={{ color: '#ccc' }} />
    : isValid ? <CheckIcon color='success' />
    : null
  );
}
