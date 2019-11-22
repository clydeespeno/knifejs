import p from 'path';
import url from 'url';
import querystring from 'querystring';
import http from 'http';
import https from 'https';
import zlib from 'zlib';

import {signator, requiredHeaders} from './utils';

export default (config) => {
  const chef = chefHttp(config);
  return {
    get: (path, options) => chef({
      path,
      params: options.params,
      timestamp: options.timestamp,
      method: 'GET'
    }),

    put: (path, options) => chef({
      path,
      params: options.params,
      body: options.body,
      timestamp: options.timestamp,
      method: 'PUT'
    }),

    post: (path, options) => chef({
      path,
      body: options.body,
      timestamp: options.timestamp,
      method: 'POST'
    }),

    del: (path, options) => chef({
      path,
      params: options.params,
      timestamp: options.timestamp,
      method: 'DELETE'
    })
  };
};

function chefHttp({
  key,
  opsUserId,
  chefVersion,
  baseUrl,
  organization,
  httpAgent = http.globalAgent,
  httpsAgent = https.globalAgent,
  promiseLibrary = global.Promise
}) {
  const request = requestor(baseUrl, httpAgent, httpsAgent, promiseLibrary);
  const headers = requiredHeaders({
    opsUserId,
    chefVersion,
    sign: signator(key)
  });

  return ({
    path,
    method,
    body,
    params = {},
    timestamp = new Date()
      .toISOString()
      .replace(/\....Z/, 'Z')
  }) => {
    const requestPath = p.join(`/organizations/${organization}`, path);
    return request({
      method,
      params,
      path: requestPath,
      headers: headers({
        method,
        body,
        timestamp,
        path: requestPath
      })
    });
  };
}

function requestor(baseUrl, httpAgent, httpsAgent, promiseLibrary) {
  const Promise = promiseLibrary;
  const {agent, adapter} = url.parse(baseUrl).protocol === 'https:' ?
    {agent: httpsAgent, adapter: https} : {agent: httpAgent, adapter: http};

  return options => new Promise((resolve, reject) => {
    const body = options.body ? JSON.stringify(options.body) : null;
    const req = adapter.request(
      buildRequest(baseUrl, {agent, ...options}, body),
      getData(resolve, reject)
    );
    req.on('error', (e) => {
      reject(e);
    });
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function getData(resolve, reject) {
  return (res) => {
    consumeBody(res, (data) => {
      if (res.statusCode === 200) {
        try {
          return resolve(JSON.parse(data));
        } catch (e) {
          return reject(e);
        }
      }
      reject(new Error(`Consul did not respond with 200 - [${res.statusCode}] with body: \n${data}`));
    });
  };
}

function consumeBody(res, callback) {
  if (res.headers['content-encoding'] && res.headers['content-encoding'] === 'gzip') {
    return consumeGzip(res, callback);
  }
  return consumePlain(res, callback);
}

function consumePlain(res, callback) {
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => rawData += chunk);
  res.on('end', () => {
    callback(rawData);
  });
}

function consumeGzip(res, callback) {
  const gzip = zlib.createGunzip();
  res.pipe(gzip);
  const data = [];

  gzip.on('data', (chunk) => data.push(chunk.toString()));
  gzip.on('end', () => {
    callback(data.join(''));
  });
}

function buildRequest(baseUrl, options, body) {
  const parsedUrl = parseUrl(baseUrl, options.path, options.params);
  return {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: options.method,
    agent: options.agent,
    headers: {...options.headers, ...(body ? {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    } : {})}
  };
}

function parseUrl(baseUrl, path, params) {
  return url.parse(
    (baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl) +
    '/' +
    (path.startsWith('/') ? path.substring(1) : path) +
    (params ? `?${querystring.stringify(params)}` : '' )
  );
}
