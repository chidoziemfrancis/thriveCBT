import { readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

import converter from 'openapi-to-postmanv2';

const TOKEN_ROUTES = ['/auth/register', '/auth/login', '/auth/refresh'];
const SAVE_TOKENS = [
  'const body = pm.response.json();',
  'if (body.accessToken) pm.environment.set("accessToken", body.accessToken);',
  'if (body.refreshToken) pm.environment.set("refreshToken", body.refreshToken);',
];

const openapi = JSON.parse(readFileSync('docs/api/openapi.json', 'utf8'));
const convert = promisify(converter.convert);
const result = await convert(
  { type: 'json', data: openapi },
  {
    folderStrategy: 'Tags',
    requestParametersResolution: 'Example',
    includeAuthInfoInExample: false,
  },
);
if (!result.result)
  throw new Error(`Postman conversion failed: ${result.reason}`);
const collection = result.output[0].data;

// Ids are random on every run; dropping them keeps the file stable so CI can spot stale docs.
function tidy(node) {
  if (Array.isArray(node)) return node.map(tidy);
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node)
        .filter(([key]) => key !== 'id' && key !== '_postman_id')
        .map(([key, value]) => [key, tidy(value)]),
    );
  }
  return node;
}

function addTokenScripts(items) {
  for (const item of items ?? []) {
    addTokenScripts(item.item);
    const path = `/${(item.request?.url?.path ?? []).join('/')}`;
    if (TOKEN_ROUTES.some((route) => path.endsWith(route))) {
      item.event = [
        {
          listen: 'test',
          script: { type: 'text/javascript', exec: SAVE_TOKENS },
        },
      ];
    }
  }
}

const tidied = tidy(collection);
addTokenScripts(tidied.item);
tidied.info.name = 'ThriveCBT API';
tidied.auth = {
  type: 'bearer',
  bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }],
};
tidied.variable = [
  { key: 'baseUrl', value: 'http://localhost:3000', type: 'string' },
];

writeFileSync(
  'postman/thrivecbt.postman_collection.json',
  `${JSON.stringify(tidied, null, 2)}\n`,
);
console.log('postman/thrivecbt.postman_collection.json written');
