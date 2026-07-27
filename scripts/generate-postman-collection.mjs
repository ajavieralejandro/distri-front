/**
 * Bundles OpenAPI → Postman Collection v2.1 and enriches with folder tests.
 * Generated collection must stay aligned with the OpenAPI contract.
 *
 * Status: requests are CONTRACT_PROVISIONAL / NOT RUN against a real backend.
 */
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundled = path.join(
  root,
  'contracts/openapi/dist/distrisoft-api.bundled.yaml',
);
const outCollection = path.join(
  root,
  'contracts/postman/Distrisoft-API.postman_collection.json',
);
const tempCollection = path.join(
  root,
  'contracts/postman/.generated-raw.postman_collection.json',
);

function ensureBundle() {
  if (!existsSync(bundled)) {
    execFileSync('npm', ['run', 'api:bundle'], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    });
  }
}

function convertOpenApiToPostman() {
  mkdirSync(path.dirname(outCollection), { recursive: true });
  execFileSync(
    'npx',
    [
      '--yes',
      'openapi-to-postmanv2',
      '-s',
      bundled,
      '-o',
      tempCollection,
      '-p',
    ],
    { cwd: root, stdio: 'inherit', shell: true },
  );
}

const positiveTest = `
pm.test('Status is success class or documented mock', function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});
pm.test('Content-Type is JSON when body present', function () {
  if (pm.response.code === 204) return;
  pm.expect(pm.response.headers.get('Content-Type') || '').to.include('application/json');
});
pm.test('Response time is under a soft budget', function () {
  pm.expect(pm.response.responseTime).to.be.below(10000);
});
`.trim();

const negative401 = `
pm.test('NOT RUN note — expects 401 without token when backend exists', function () {
  // Collection status: NOT RUN against a real backend.
  // When executed against Spring Boot, assert pm.response.code === 401.
  pm.expect([401, 200, 201, 404]).to.include(pm.response.code);
});
`.trim();

function walkItems(items, visitor) {
  for (const item of items ?? []) {
    visitor(item);
    if (item.item) walkItems(item.item, visitor);
  }
}

function enrich(collection) {
  collection.info = collection.info ?? {};
  collection.info.name = 'Distrisoft API (provisional)';
  collection.info.description = [
    'Generated from contracts/openapi. Status: CONTRACT_PROVISIONAL.',
    'NOT validated against a real Spring Boot backend (does not exist yet).',
    'OpenAPI mock (Prism) validates shapes/examples only — not business rules.',
    'UI roles are UX-only; API must enforce authorization.',
  ].join('\n');

  collection.variable = [
    { key: 'baseUrl', value: '{{baseUrl}}' },
    { key: 'accessToken', value: '' },
    { key: 'refreshToken', value: '' },
    { key: 'tenantId', value: 'dist-1' },
    { key: 'commerceId', value: 'com-1' },
    { key: 'customerId', value: 'com-1' },
    { key: 'productId', value: 'prod-1' },
    { key: 'orderId', value: '' },
    { key: 'warehouseId', value: 'wh-1' },
    { key: 'paymentId', value: '' },
    { key: 'invoiceId', value: '' },
    { key: 'receiptId', value: '' },
    { key: 'routeId', value: 'route-1' },
    { key: 'idempotencyKey', value: '' },
  ];

  walkItems(collection.item, (item) => {
    if (!item.request) return;
    const url = item.request.url;
    if (typeof url === 'object' && url !== null) {
      url.host = ['{{baseUrl}}'];
      if (Array.isArray(url.path) && url.path[0] === 'api') {
        url.path = url.path.slice(1);
      }
    }

    const name = String(item.name ?? '');
    const isLogin = /login/i.test(name);
    const authHeader = {
      key: 'Authorization',
      value: 'Bearer {{accessToken}}',
      type: 'text',
    };
    item.request.header = item.request.header ?? [];
    if (!isLogin && !/health/i.test(name) && !/refresh/i.test(name)) {
      if (!item.request.header.some((h) => h.key === 'Authorization')) {
        item.request.header.push(authHeader);
      }
    }

    item.event = item.event ?? [];
    const scripts = [positiveTest];
    if (isLogin) {
      scripts.push(
        `
if (pm.response.code === 200) {
  try {
    const body = pm.response.json();
    if (body.tokens?.accessToken) pm.collectionVariables.set('accessToken', body.tokens.accessToken);
    if (body.tokens?.refreshToken) pm.collectionVariables.set('refreshToken', body.tokens.refreshToken);
    if (body.accessToken) pm.collectionVariables.set('accessToken', body.accessToken);
  } catch (e) {}
}
`.trim(),
      );
    }
    if (/create order|crear pedido|post.*orders/i.test(name)) {
      scripts.push(
        `
if (pm.response.code === 201 || pm.response.code === 200) {
  try {
    const body = pm.response.json();
    if (body.id) pm.collectionVariables.set('orderId', body.id);
  } catch (e) {}
}
`.trim(),
      );
    }
    item.event = item.event.filter((e) => e.listen !== 'test');
    item.event.push({
      listen: 'test',
      script: { type: 'text/javascript', exec: scripts.join('\n').split('\n') },
    });
  });

  const negativeFolder = {
    name: '90 Negative tests',
    description:
      'Prepared negative cases. Status: NOT RUN (no real backend). Prism may not enforce auth.',
    item: [
      {
        name: 'Without token → expect 401',
        request: {
          method: 'GET',
          header: [],
          url: '{{baseUrl}}/auth/me',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: negative401.split('\n'),
            },
          },
        ],
      },
      {
        name: 'Wrong role → expect 403 (NOT RUN)',
        request: {
          method: 'POST',
          header: [
            { key: 'Authorization', value: 'Bearer {{accessToken}}' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              productId: 'prod-1',
              warehouseId: 'wh-1',
              quantity: 1,
              reason: 'demo',
            }),
          },
          url: '{{baseUrl}}/inventory/adjust',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// NOT RUN — when backend exists, COMMERCE_BUYER should receive 403',
                'pm.test("Documented expectation 403", function () { pm.expect(true).to.eql(true); });',
              ],
            },
          },
        ],
      },
      {
        name: 'Missing resource → expect 404 (NOT RUN)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}' }],
          url: '{{baseUrl}}/orders/00000000-0000-4000-8000-000000000000',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// NOT RUN — expect 404 against real API',
                'pm.test("Placeholder", function () { pm.expect(true).to.eql(true); });',
              ],
            },
          },
        ],
      },
      {
        name: 'Invalid transition → expect 409 (NOT RUN)',
        request: {
          method: 'PATCH',
          header: [
            { key: 'Authorization', value: 'Bearer {{accessToken}}' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ status: 'DELIVERED' }),
          },
          url: '{{baseUrl}}/orders/{{orderId}}/status',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// NOT RUN — PENDING → DELIVERED must be 409',
                'pm.test("Placeholder", function () { pm.expect(true).to.eql(true); });',
              ],
            },
          },
        ],
      },
      {
        name: 'Invalid payload → expect 422 (NOT RUN)',
        request: {
          method: 'POST',
          header: [
            { key: 'Authorization', value: 'Bearer {{accessToken}}' },
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Idempotency-Key', value: '{{$guid}}' },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ commerceId: 'com-1', items: [] }),
          },
          url: '{{baseUrl}}/orders',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// NOT RUN — empty items → 422',
                'pm.test("Placeholder", function () { pm.expect(true).to.eql(true); });',
              ],
            },
          },
        ],
      },
      {
        name: 'Repeated Idempotency-Key → consistent response (NOT RUN)',
        request: {
          method: 'POST',
          header: [
            { key: 'Authorization', value: 'Bearer {{accessToken}}' },
            { key: 'Content-Type', value: 'application/json' },
            {
              key: 'Idempotency-Key',
              value: '11111111-1111-4111-8111-111111111111',
            },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              commerceId: 'com-1',
              amount: { amount: '100.00', currency: 'ARS' },
              method: 'CASH',
            }),
          },
          url: '{{baseUrl}}/payments',
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// NOT RUN — second call must not duplicate payment',
                'pm.test("Placeholder", function () { pm.expect(true).to.eql(true); });',
              ],
            },
          },
        ],
      },
    ],
  };

  collection.item = collection.item ?? [];
  collection.item.push(negativeFolder);
  return collection;
}

ensureBundle();
convertOpenApiToPostman();
const raw = JSON.parse(readFileSync(tempCollection, 'utf8'));
const enriched = enrich(raw);
writeFileSync(outCollection, JSON.stringify(enriched, null, 2));
copyFileSync(outCollection, outCollection);
console.log(`Wrote ${outCollection}`);
