export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  data?: object;
  params?: object;
  responseType?: 'json' | 'blob' | 'formData' | 'arrayBuffer' | 'text' | string;
  withTimestamp?: boolean;
}

export interface FetchResponse extends Response {
  data: any;
}

export interface FetchResponseError extends Error {
  response: FetchResponse;
}

declare class FetchRequest {
  constructor(options: RequestOptions);

  request(url: string, options: RequestOptions): Promise<FetchResponse>;

  get(url: string, options: RequestOptions): Promise<FetchResponse>;
  delete(url: string, options: RequestOptions): Promise<FetchResponse>;
  head(url: string, options: RequestOptions): Promise<FetchResponse>;
  options(url: string, options: RequestOptions): Promise<FetchResponse>;

  post(url: string, data: string | object, options: RequestOptions): Promise<FetchResponse>;
  put(url: string, data: string | object, options: RequestOptions): Promise<FetchResponse>;
  patch(url: string, data: string | object, options: RequestOptions): Promise<FetchResponse>;

  setupRequestInterceptor(interceptor: (options: RequestOptions) => RequestOptions);
  setupResponseInterceptor(interceptor: (response: FetchResponse) => any, errorInterceptor: (error: FetchResponseError) => any);
}

declare module '@hirohe/fetch-request' {
  const _init: FetchRequest;
  export default _init;
}
