fetch-request ![](https://img.shields.io/npm/v/@hirohe/fetch-request.svg)
=============

a wrapper of [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)

make it more like 'axios'

⚠️⚠️⚠️ still work in progress ⚠️⚠️⚠️

### install

```bash
npm install --save @hirohe/fetch-request
```

### usage

#### example
```js
import FetchRequest from '@hirohe/fetch-request'

const options = {
  baseUrl: '/api',
  headers: { 'content-type': 'application/json' },
};
// make new instance with options
const request = new FetchRequest(options);

// setup response interceptor
request.setupResponseInterceptor(response => {
  // do something
}, error => {
  // handle with error
});

// GET /api/test?q=hello&_t=1532915637137
// will add timestamp param '_t' by default
request.get('/test', { params: { q: 'hello' } });
```

### request options

request options use to initialze FetchRequest, extend from [RequestInit](https://fetch.spec.whatwg.org/#request-class)

`const request = new FetchRequest(options);`

```js
export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  data?: object;
  params?: object;
  responseType?: 'json' | 'blob' | 'formData' | 'arrayBuffer' | 'text' | string;
  withTimestamp?: boolean;
}
```

- `baseUrl`: prepended to `url`.
- `data`: the request body data, it should be plain object for now...
- `params`: will add to request query string, should be plain object.
- `responseType`: decide witch type of response is, can be 'json', 'blob', 'formData', 'arrayBuffer', 'text'. is 'json' by default
- `withTimestamp`: weather append timestamp param to query string, e.g: `_t=1532915637137`. it makes each request unique, prevent getting cache from server, is `true` by default

### request methods

request.get(url\[, options\])

request.delete(url\[, options\])

request.head(url\[, options\])

request.options(url\[, options\])

request.post(url\[, data\[, options\]\])

request.put(url\[, data\[, options\]\])

request.patch(url\[, data\[, options\]\])


... //WIP
