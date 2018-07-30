import fetch from 'isomorphic-fetch';
import qs from 'qs';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseData(response, responseType) {
  let data;

  switch (responseType) {
    case 'json':
      data = response.json();
      break;
    case 'blob':
      data = response.blob();
      break;
    case 'formData':
      data = response.formData();
      break;
    case 'arrayBuffer':
      data = response.arrayBuffer();
      break;
    default:
      data = response.text();
  }

  return data.then(_data => {
    response.data = _data;
    return response;
  });
}

function addTimestampQuery(url) {
  if (url.indexOf('?') !== -1) {
    return `${url}&_t=${new Date().getTime()}`;
  } else {
    return `${url}?_t=${new Date().getTime()}`;
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options) {
  const { requestInterceptor, responseInterceptor, responseErrorInterceptor } = options;
  if (typeof requestInterceptor === 'function') {
    options = requestInterceptor(options);
  }

  return fetch(url, options)
    // http status check
    .then(checkStatus)
    // data parse
    .then(response => parseData(response, options.responseType))
    .then(response => {
      if (typeof responseInterceptor === 'function') {
        return responseInterceptor(response);
      }
      return response;
    })
    .catch(error => {
      if (typeof responseErrorInterceptor === 'function') {
        return responseErrorInterceptor(error);
      }
      // return reject if no error interceptor
      return Promise.reject(error);
    });
}

function FetchRequest(options) {
  this.defaultOptions = {
    baseUrl: '',
    method: 'GET',
    headers: {},
    data: {},
    params: {},
    responseType: 'json',
    withTimestamp: true,
    credentials: 'include',
    requestInterceptor: null,
    responseInterceptor: null,
    responseErrorInterceptor: null,
    ...options,
  };
}

function buildUrlWithQueryData(url, data) {
  if (data) {
    if (url.indexOf('?') !== -1) {
      return `${url}&${qs.stringify(data)}`;
    }
    return `${url}?${qs.stringify(data)}`;
  }
  return url;
}

function buildRequestBody(data, contentType) {
  if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) return qs.stringify(data);
  if (contentType.indexOf('application/json') !== -1) return JSON.stringify(data);
  // not to handle by default
  return data;
}

const METHODS_WITHOUT_BODY = ['get', 'delete', 'head', 'options'];
const METHODS_WITH_BODY = ['post', 'put', 'patch'];

FetchRequest.prototype.request = function (options) {
  let url = options.url;
  // merge with default options
  options = { ...this.defaultOptions, ...options };

  // pre handle headers, make each header name lowercase
  Object.keys(options.headers).forEach(headerName => {
    const val = options.headers[headerName];
    delete options.headers[headerName];
    options.headers[headerName.toLowerCase()] = val;
  });

  // handle method
  url = buildUrlWithQueryData(url, options.params);
  options.method = options.method.toLowerCase();
  if (METHODS_WITH_BODY.includes(options.method)) {
    if (options.data !== undefined && options.data !== null) {
      if (!options.headers['content-type']) { // set default content-type header
        options.headers['content-type'] = 'application/x-www-form-urlencoded';
      }
      options.body = buildRequestBody(options.data, options.headers['content-type']);
    }
  }

  // concat with baseUrl
  url = options.baseUrl + url;

  // with timestamp query string
  if (options.withTimestamp === true) {
    url = addTimestampQuery(url);
  }

  return request(url, options);
};

// the methods without body
METHODS_WITHOUT_BODY.forEach(method => {
  FetchRequest.prototype[method] = function (url, options) {
    return this.request({ method, url, ...options });
  }
});

// the methods with body
METHODS_WITH_BODY.forEach(method => {
  FetchRequest.prototype[method] = function (url, data, options) {
    return this.request({ method, url, data, ...options });
  }
});

// request interceptor
FetchRequest.prototype.setupRequestInterceptor = function(interceptor) {
  if (typeof interceptor === 'function') {
    this.defaultOptions.requestInterceptor = interceptor;
  }
};

// response interceptor
FetchRequest.prototype.setupResponseInterceptor = function(responseInterceptor, errorInterceptor) {
  if (typeof responseInterceptor === 'function') {
    this.defaultOptions.responseInterceptor = responseInterceptor;
  }
  if (typeof errorInterceptor === 'function') {
    this.defaultOptions.responseErrorInterceptor = errorInterceptor;
  }
};

export default FetchRequest;
