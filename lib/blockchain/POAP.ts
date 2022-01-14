import { GET } from '../http';

const POAP_API_URL = 'https://api.poap.xyz';

export interface POAPEvent {
  id: number;
  name: string;
}

export function getEvents (): Promise<POAPEvent[]> {
  return GET<POAPEvent[]>('/blockchain/getPOAPEvents');
  // TODO: Just call the public api
  //return GET(POAP_API_URL + '/events');
}