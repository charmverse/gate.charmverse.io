import promiseRetry from 'promise-retry';
import request from 'request-promise-native';

// Note on urlEncodedForm option
//  - urlEncodedForm attachs the data to the form field instead of body
//    (which inherently sets the Content-type to application/x-www-form-urlencoded and converts form data to querystring)
//    reference here https://www.npmjs.com/package/request#forms

export interface RetryOptions {
  factor: number;
  minTimeout: number;
  retries: number;
  retryDecision: (err: any) => boolean;
}

export interface RequestOptions extends request.RequestPromiseOptions {
  urlEncodedForm?: boolean;
}

const DEFAULT_REQUEST_OPTIONS: request.RequestPromiseOptions = {
  timeout: 5 * 60 * 1000,
  json: true
};

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  factor: 2,
  minTimeout: 1000, // milliseconds
  retries: 3,
  retryDecision: function abortOn4xx (err) {
    if (err?.statusCode && err.statusCode > 300 && err.statusCode < 500) {
      return true;
    }
    return !err;
  }
};

type HTTPMethod = 'DELETE' | 'GET' | 'POST' | 'PUT' | 'PATCH';

function makeRequest (
  httpMethod: HTTPMethod,
  requestURL: string,
  data: object | string, // string for form data
  requestOptions: RequestOptions
) {

  const payload: request.OptionsWithUrl = Object.assign({
    url: requestURL
  }, requestOptions);

  if (httpMethod !== 'GET') {
    payload.body = data;
    if (requestOptions && requestOptions.urlEncodedForm) {
      payload.form = data;
      payload.json = undefined;
    }
    else {
      payload.body = data;
    }
  }
  else if (httpMethod === 'GET') {
    payload.qs = data;
  }

  payload.method = httpMethod;

  return request(payload)
    .catch((err: any) => {
      throw {
        error: err.error,
        message: err.message,
        name: err.name,
        options: err.options,
        statusCode: err.statusCode
      };
    });
}

function retryMETHOD<T> (
  method: HTTPMethod,
  requestURL: string,
  data: object | string,
  _requestOptions: RequestOptions = {},
  _retryOptions: Partial<RetryOptions> = {}
): Promise<T> {

  const requestOptions = { ...DEFAULT_REQUEST_OPTIONS, ..._requestOptions };
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ..._retryOptions };

  return promiseRetry((retryFn, retryNumber) => {
    return makeRequest(
      method,
      requestURL,
      data,
      requestOptions
    ).catch((err: any) => {
      if (!retryOptions.retryDecision(err)) {
        retryFn(err);
      }
      else {
        throw err;
      }
    });
  },
  retryOptions);
}


export function GET<T = any> (
  requestURL: string,
  data: object = {},
  requestOptions?: RequestOptions,
  retryOptions?: Partial<RetryOptions>
) {
  return retryMETHOD<T>('GET', requestURL, data, requestOptions, retryOptions);
}

export function POST<T = any> (
  requestURL: string,
  data: object | string = {},
  requestOptions?: RequestOptions,
  retryOptions?: Partial<RetryOptions>
) {
  return retryMETHOD<T>('POST', requestURL, data, requestOptions, retryOptions);
}

export function PATCH<T = any> (
  requestURL: string,
  data: object | string = {},
  requestOptions?: RequestOptions,
  retryOptions?: Partial<RetryOptions>
) {
  return retryMETHOD<T>('PATCH', requestURL, data, requestOptions, retryOptions);
}

export function PUT<T = any> (
  requestURL: string,
  data: object = {},
  requestOptions?: RequestOptions,
  retryOptions?: Partial<RetryOptions>
) {
  return retryMETHOD<T>('PUT', requestURL, data, requestOptions, retryOptions);
}

export function DELETE<T = any> (
  requestURL: string,
  data: object = {},
  requestOptions?: RequestOptions,
  retryOptions?: Partial<RetryOptions>
) {
  return retryMETHOD<T>('DELETE', requestURL, data, requestOptions, retryOptions);
}


export function parseCookies (str: string) {
  let rx = /([^;=\s]*)=([^;]*)/g;
  let obj: any = { };
  for ( let m ; m = rx.exec(str) ; )
    obj[ m[1] ] = decodeURIComponent( m[2] );
  return obj;
}