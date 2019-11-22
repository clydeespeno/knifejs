import fs from 'fs';
import https from 'https';
import knife from '../knife/knife';
import client from '../knife/client';

export default (program) => f => {
  if (fs.existsSync(program.config)) {
    return Promise.resolve(f(knifejs(program.config))).then(p => {
      if (p) {
        console.log(p);
      }
    });

  }
  console.log(`Configuration file ${program.config} does not exists. Please create config.`);
  console.log('ex:');
  console.log('{');
  console.log('  "baseUrl": "https://my.chef.com",');
  console.log('  "organization": "myorg",');
  console.log('  "keyPath": "/path/to/user/key.pem",');
  console.log('  "opsUserId": "userId",');
  console.log('  "chefVersion": "12.4.0"');
  console.log('}');
};

function knifejs(configPath) {
  try {
    const config = fs.readFileSync(configPath).toString();
    return knife(client(buildConfig(JSON.parse(config))));
  } catch (e) {
    console.log('Unable to parse config: ', e.message);
    process.exit(1);
  }
}

function buildConfig(config) {
  return {
    baseUrl: config.baseUrl,
    organization: config.organization,
    key: fs.readFileSync(config.keyPath),
    opsUserId: config.opsUserId,
    chefVersion: config.chefVersion,
    httpsAgent: new https.Agent({keepAlive: true, rejectUnauthorized: false})
  };
}
