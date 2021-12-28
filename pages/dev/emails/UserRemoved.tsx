
import { GetServerSidePropsContext } from 'next';
import Page from '../../../layouts/Page';
import { renderMJML } from '../../../lib/email/templates/utils';
import UserRemoved from '../../../lib/email/templates/UserRemoved';
import { NotionGate } from '@prisma/client';

interface ClientProps {
  html: string;
}

export const gate: NotionGate = {
  createdAt: new Date(),
  updatedAt: null,
  userId: '',
  id: '',
  spaceDomain: 'myspace.io',
  spaceIcon: '',
  spaceName: 'My Space',
  spaceId: 'space_id',
  tokenAddress: '0x00',
  tokenName: 'My Token',
  tokenSymbol: 'MT',
  tokenChainId: 1,
  tokenType: 'ERC20',
  tokenMin: 0,
};


export function getServerSideProps (context: GetServerSidePropsContext) {

  const html = renderMJML(<UserRemoved gate={gate} />);
  const props: ClientProps = { html };
  return { props };
}

export default function TemplatePreview ({ html }: ClientProps) {
  return (<div>
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </div>);
}