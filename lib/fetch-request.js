'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch = _interopDefault(require('isomorphic-fetch'));
var qs = _interopDefault(require('qs'));

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseData(response, responseType) {
  var data = void 0;

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

  return data.then(function (_data) {
    response.data = _data;
    return response;
  });
}

function addTimestampQuery(url) {
  if (url.indexOf('?') !== -1) {
    return url + '&_t=' + new Date().getTime();
  } else {
    return url + '?_t=' + new Date().getTime();
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
  var _options = options,
      requestInterceptor = _options.requestInterceptor,
      responseInterceptor = _options.responseInterceptor,
      responseErrorInterceptor = _options.responseErrorInterceptor;

  if (typeof requestInterceptor === 'function') {
    options = requestInterceptor(options);
  }

  return fetch(url, options)
  // http status check
  .then(checkStatus)
  // data parse
  .then(function (response) {
    return parseData(response, options.responseType);
  }).then(function (response) {
    if (typeof responseInterceptor === 'function') {
      return responseInterceptor(response);
    }
    return response;
  }).catch(function (error) {
    if (typeof responseErrorInterceptor === 'function') {
      return responseErrorInterceptor(error);
    }
    // return reject if no error interceptor
    return Promise.reject(error);
  });
}

function FetchRequest(options) {
  this.defaultOptions = _extends({
    baseUrl: '',
    method: 'GET',
    headers: {},
    responseType: 'json',
    withTimestamp: true,
    credentials: 'include',
    requestInterceptor: null,
    responseInterceptor: null,
    responseErrorInterceptor: null
  }, options);
}

function buildUrlWithQueryData(url, data) {
  if (data) {
    if (url.indexOf('?') !== -1) {
      return url + '&' + qs.stringify(data);
    }
    return url + '?' + qs.stringify(data);
  }
  return url;
}

function buildRequestBody(data, contentType) {
  if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) return qs.stringify(data);
  if (contentType.indexOf('application/json') !== -1) return JSON.stringify(data);
  // not to handle by default
  return data;
}

var METHODS_WITHOUT_BODY = ['get', 'delete', 'head', 'options'];
var METHODS_WITH_BODY = ['post', 'put', 'patch'];

FetchRequest.prototype.request = function (options) {
  var url = options.url;
  // merge with default options
  options = _extends({}, this.defaultOptions, options);

  // pre handle headers, make each header name lowercase
  Object.keys(options.headers).forEach(function (headerName) {
    var val = options.headers[headerName];
    delete options.headers[headerName];
    options.headers[headerName.toLowerCase()] = val;
  });

  // handle method
  url = buildUrlWithQueryData(url, options.params);
  options.method = options.method.toLowerCase();
  if (METHODS_WITH_BODY.includes(options.method)) {
    if (options.data !== undefined && options.data !== null) {
      if (!options.headers['content-type']) {
        // set default content-type header
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
METHODS_WITHOUT_BODY.forEach(function (method) {
  FetchRequest.prototype[method] = function (url, options) {
    return this.request(_extends({ method: method, url: url }, options));
  };
});

// the methods with body
METHODS_WITH_BODY.forEach(function (method) {
  FetchRequest.prototype[method] = function (url, data, options) {
    return this.request(_extends({ method: method, url: url, data: data }, options));
  };
});

// request interceptor
FetchRequest.prototype.setupRequestInterceptor = function (interceptor) {
  if (typeof interceptor === 'function') {
    this.defaultOptions.requestInterceptor = interceptor;
  }
};

// response interceptor
FetchRequest.prototype.setupResponseInterceptor = function (responseInterceptor, errorInterceptor) {
  if (typeof responseInterceptor === 'function') {
    this.defaultOptions.responseInterceptor = responseInterceptor;
  }
  if (typeof errorInterceptor === 'function') {
    this.defaultOptions.responseErrorInterceptor = errorInterceptor;
  }
};

module.exports = FetchRequest;
