import fetch from './fetch';

type Params = { [key: string]: any };

export function GET<T> (requestURL: string, data: Params = {}): Promise<T> {
  const queryStr = Object.keys(data)
    .filter(key => !!data[key])
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
  return fetch(
    requestURL + (queryStr ? '?' + queryStr : ''),
    {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json'
      }),
      credentials: 'include'
    }
  );
}

export function DELETE<T> (requestURL: string, data: Params = {}): Promise<T> {
  return fetch(
    requestURL,
    {
      body: JSON.stringify(data),
      method: 'DELETE',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    }
  );
}

export function POST<T> (requestURL: string, data: Params = {}, { headers = {}, noHeaders }: { headers?: any, noHeaders?: boolean } = {}): Promise<T> {
  return fetch(
    requestURL,
    {
      body: JSON.stringify(data),
      method: 'POST',
      headers: noHeaders ? undefined : new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }),
      credentials: 'include'
    }
  );
}

export function PUT<T> (requestURL: string, data: Params = {}): Promise<T> {
  return fetch(
    requestURL,
    {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    }
  );
}

export function uploadFile (requestURL: string, file: File): Promise<any> {

  const formData = new FormData();

  // Update the formData object
  formData.append(
    'upload',
    file,
    file.name
  );

  return fetch(
    requestURL,
    {
      body: formData,
      method: 'POST',
      credentials: 'include'
    }
  );
}
