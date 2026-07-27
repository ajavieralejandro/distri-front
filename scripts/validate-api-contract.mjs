/**
 * Validates presence and basic integrity of the API contract artifacts.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'contracts/openapi/distrisoft-api.yaml',
  'contracts/openapi/dist/distrisoft-api.bundled.yaml',
  'contracts/postman/Distrisoft-API.postman_collection.json',
  'contracts/postman/environments/local.postman_environment.json',
  'contracts/postman/environments/mock.postman_environment.json',
  'contracts/postman/environments/staging.example.postman_environment.json',
  'contracts/traceability.md',
  'contracts/backend-implementation-roadmap.md',
  'contracts/decisions/open-questions.md',
];

const errors = [];

for (const rel of required) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) {
    errors.push(`Missing: ${rel}`);
    continue;
  }
  if (statSync(abs).size < 32) {
    errors.push(`Too small: ${rel}`);
  }
}

const collectionPath = path.join(
  root,
  'contracts/postman/Distrisoft-API.postman_collection.json',
);
if (existsSync(collectionPath)) {
  const collection = JSON.parse(readFileSync(collectionPath, 'utf8'));
  if (!collection.info?.name) errors.push('Collection missing info.name');
  if (!Array.isArray(collection.item) || collection.item.length === 0) {
    errors.push('Collection has no items');
  }
  const json = JSON.stringify(collection);
  if (!json.includes('90 Negative tests')) {
    errors.push('Collection missing negative tests folder');
  }
  if (!json.includes('NOT RUN')) {
    errors.push('Collection should document NOT RUN status');
  }
}

const bundled = path.join(
  root,
  'contracts/openapi/dist/distrisoft-api.bundled.yaml',
);
if (existsSync(bundled)) {
  const text = readFileSync(bundled, 'utf8');
  if (!text.includes('0.1.0-provisional')) {
    errors.push('Bundled OpenAPI missing provisional version');
  }
  if (!text.includes('x-contract-status')) {
    errors.push('Bundled OpenAPI missing x-contract-status');
  }
}

if (errors.length) {
  console.error('postman:validate / contract validate failed:');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log('Contract artifacts validated.');
