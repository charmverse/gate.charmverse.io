import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import PlusIcon from '@mui/icons-material/Add';
import Page, { PageSection } from '../layouts/Page';
import Button from '../components/Button';
import NotionGateForm from '../components/common/NotionGateForm';
import NotionLockForm from '../components/common/NotionLockForm';
import { Typography } from '@mui/material';
import { NotionGateSettings, LockType } from '../api';
import { LOCK_TYPES } from '../lib/blockchain/config';
import { GET } from '../lib/http/browser';

export default function OnboardingFlow () {

  const [gate, setGate] = useState<NotionGateSettings | null>(null);
  const [lockType, setLockType] = useState<LockType | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();

  function createLock () {
    router.push('/settings');
  }

  useEffect(() => {
    GET('/track/page_view', {
      title: 'Create a Notion gate'
    });
  }, []);

  return (
    <Page title={'Notion Token Gate'}>
      <PageSection sx={{ py: 6, minHeight: 700 }} width={600}>
        <Typography variant='h1' align='center' sx={{ mb: 4 }}>Create a Notion Gate</Typography>
        <Card>
          {step === 1 && <NotionGateForm gate={gate} onSubmit={createLock} />}
          {/* {step === 2 && <SelectLockType goBack={goBack} onSubmit={selectLockType} />}
          {step === 3 && <NotionLockForm goBack={goBack} gateId={gate.id} lock={{ lockType }} hasAdminAccess={gate.spaceIsAdmin} onSubmit={createLock} />} */}
        </Card>
      </PageSection>
    </Page>
  );
}

function SelectLockType ({ goBack, onSubmit }: { goBack: () => void, onSubmit: (lockType: LockType) => void }) {

  return (<>
    <CardContent sx={{ px: 4, py: 2 }}>
      <Typography variant='h2' sx={{ fontSize: 18 }}>Select a type of Access Criteria</Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ px: 4 }}>
      <Grid container spacing={3}>
        {LOCK_TYPES.map(lockType => (
          <Grid item xs={12} key={lockType.id}>
            <Button
              fullWidth={true}
              startIcon={<PlusIcon sx={{ float: 'left', fontSize: 24 }} />} variant='outlined' size='large' onClick={() => onSubmit(lockType.id)}
              sx={{ display: 'block', borderRadius: '20px', p: 2 }}>
              {lockType.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </CardContent>

    <Divider />
    <CardContent sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
      {goBack
        ? <Button variant='outlined' size='large' onClick={goBack}>
          Back
        </Button>
        : <div></div>
      }
      <div> </div>
    </CardContent>
  </>);
}