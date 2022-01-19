import { useRouter } from 'next/router';
import { useState } from 'react';
import NotionGateForm from '../components/common/NotionGateForm';
import NotionLockForm from '../components/common/NotionLockForm';

export default function OnboardingFlow () {

  const [step, setStep] = useState(0);
  const router = useRouter();

  function createGate () {
    setStep(1);
  }

  function createLock () {
    setStep(1);
    router.push('/settings');
  }

  return (<>
    {step === 0 && <NotionGateForm onSubmit={createGate} />}
    {step === 1 && <NotionLockForm onSubmit={createLock} />}
  </>);
}
