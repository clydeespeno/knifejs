import {describe, it, beforeEach} from 'mocha';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import knifeCreator from './knife';
import sinon from 'sinon';

chai.use(sinonChai);

const expect = chai.expect;
expect();

describe('knife', () => {

  const client = {};

  const sandbox = sinon.sandbox.create();

  const knife = knifeCreator(client);

  beforeEach(() => {
    sandbox.restore();
  });

  it('search node name:<name>', async () => {
    client.get = sandbox.spy(() => ({then: () => ({})}));
    await knife.search.node({
      q: 'name:FTR-salmon-*'
    });
    expect(client.get).to.have.been.calledWith('/search/node', {
      params: {
        q: 'name:FTR-salmon-*'
      }
    });
  });

});
