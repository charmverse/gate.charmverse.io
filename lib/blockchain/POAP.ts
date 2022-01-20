import { GET } from '../http/browser';

const POAP_API_URL = 'https://api.poap.xyz';

export interface POAPEvent {
  id: number;
  image_url: string;
  name: string;
}

export function getEvents (): Promise<POAPEvent[]> {
  return GET(POAP_API_URL + '/events');
}

export function getEventById (id: number): Promise<POAPEvent> {
  return GET<POAPEvent>(POAP_API_URL + '/events/id/' + id);
}