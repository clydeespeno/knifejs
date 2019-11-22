import ursa from 'ursa';
import crypto from 'crypto';

export function signator(key) {
  const privateKey = ursa.coercePrivateKey(key);

  return (obj) => privateKey.privateEncrypt(obj, 'utf8', 'base64');
}

export function requiredHeaders({sign, opsUserId, chefVersion}) {
  return ({
    path,
    body,
    method,
    timestamp
  }) => {
    const hashedBody = sha(body ? JSON.stringify(body) : '');

    return {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
      'X-Ops-Sign': 'algorithm=sha1;version=1.0;',
      'X-Ops-UserId': opsUserId,
      'X-Ops-Timestamp': timestamp,
      'X-Ops-Content-Hash': hashedBody,
      'X-Chef-Version': chefVersion,
      ...buildOpsAuthorization({
        sign,
        method,
        path,
        hashedBody,
        timestamp,
        opsUserId
      })
    };
  };
}

export function buildOpsAuthorization({
  sign,
  method,
  path,
  hashedBody,
  timestamp,
  opsUserId
}) {

  return sign(buildSignableAuth({
    method,
    path,
    hashedBody,
    timestamp,
    opsUserId
  })).match(/.{1,60}/g)
    .reduce(([n, auth], a) => {
      auth[`X-Ops-Authorization-${n}`] = a;
      return [n + 1, auth];
    }, [1, {}])[1];
}

export function buildSignableAuth({
  method,
  path,
  hashedBody,
  timestamp,
  opsUserId,
}) {
  return oReduce({
    Method: method,
    'Hashed Path': sha(path),
    'X-Ops-Content-Hash': hashedBody,
    'X-Ops-Timestamp': timestamp,
    'X-Ops-UserId': opsUserId
  }, (a, v, k) => `${a}\n${k}:${v}`, '').trim();
}

export function sha(s) {
  const sum = crypto.createHash('sha1');
  sum.update(s);
  return sum.digest('base64');
}

export function formatValue(a, p = 0) {
  if (isArray(a)) {
    return `[${a.join(', ')}]`;
  }
  if (typeof a === 'object') {
    return oReduce(a, (f, v, k) => `${f}\n${pad(p)}${k}: ${formatValue(v, p + 2)}`, '');
  }
  return a;
}

function pad(p) {
  return ' '.repeat(p);
}

export function formatArray(a) {
  if (isArray(a)) {
    return a.reduce((m, n) => `${m}\n${n}`, '').trim();
  }
  return a;
}

export function oMap(o, f, store = {}) {
  return oReduce(o, (a, v, k) => ({...a, [k]: f(v, k)}), store);
}

export function oReduce(o, f, store = {}) {
  return Object.keys(o).reduce((a, k) => f(a, o[k], k), store);
}

export function isArray(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
}


export const formatProxy = r => new Proxy(r, {
  get: (target, prop) => {
    if (prop === 'format') {
      return (format = (target) => target) => format(target);
    }
    return target[prop];
  }
});
