
import { GetServerSidePropsContext } from 'next';
import { renderMJML } from '../../../lib/email/templates/utils';
import UserAdded from '../../../lib/email/templates/UserAdded';

interface ClientProps {
  html: string;
}

import { gate } from './UserRemoved';

export function getServerSideProps (context: GetServerSidePropsContext) {
  const html = renderMJML(<UserAdded address={'0x66525057AC951a0DB5C9fa7fAC6E056D6b8997E2'} chainId={1} gate={gate} />);
  const props: ClientProps = { html };
  return { props };
}

export default function TemplatePreview ({ html }: ClientProps) {
  return (<div>
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </div>);
}