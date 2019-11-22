import {describe, it} from 'mocha';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import {buildSignableAuth, sha} from './utils';

chai.use(sinonChai);

const expect = chai.expect;
expect();

describe('chef utils', () => {

  it('generates the signable content correctly', () => {
    expect(buildSignableAuth({
      method: 'GET',
      path: '/organizations/shopback/search/node',
      hashedBody: sha(''),
      timestamp: '2017-03-30T02:03:03Z',
      opsUserId: 'jenkins'
    })).to.equal(
      'Method:GET\n' +
      'Hashed Path:L8nASTWR+Hfqq0HvjE39Vhj3U+k=\n' +
      'X-Ops-Content-Hash:2jmj7l5rSw0yVb/vlWAYkK/YBwk=\n' +
      'X-Ops-Timestamp:2017-03-30T02:03:03Z\n' +
      'X-Ops-UserId:jenkins'
    );
  });

});
