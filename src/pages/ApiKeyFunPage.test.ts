import assert from 'node:assert/strict';
import test from 'node:test';
import { loadHookModule, deferred, settlePromises } from '../../tests/helpers/reactHookHarness';

function walk(node: any): any[] {
  return Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
}

function setup() {
  const pending = [deferred<{models: {id: string}[]}>(), deferred<{models: {id: string}[]}>()];
  const records = ['A', 'B'].map(id => ({id, key: `synthetic-${id}`, name: id, createdAt: 1, lastUsedAt: 1}));
  const t = (key: string) => key;
  const Modal = () => null;
  const h = loadHookModule(new URL('./ApiKeyFunPage.tsx', import.meta.url), {
    'react-i18next': {useTranslation: () => ({t})},
    '@tauri-apps/plugin-opener': {openUrl: async () => {}},
    '../stores/useSponsorStore': {useSponsorStore: (select: any) => select({state: {sponsorModule: null}})},
    '../assets/icons/nmoon.svg': 'nmoon.svg',
    '../components/apiKeyFun/ApiKeyFunKeyConfigModal': {ApiKeyFunKeyConfigModal: Modal},
    '../services/modelProviderUsageService': {queryModelProviderUsage: async () => ({}), listModelProviderModels: ({apiKey}: {apiKey: string}) => pending[apiKey.endsWith('A') ? 0 : 1].promise},
  }, {window: {localStorage: {getItem: () => JSON.stringify(records), setItem() {}}, setTimeout: () => 1, clearTimeout() {}}, navigator: {}, Intl, console});
  let tree = h.render(() => h.exports.ApiKeyFunPage());
  const flush = () => {tree = h.flush();};
  const modal = () => walk(tree).find(node => node.type === Modal);
  return {pending, h, modal, flush,
    open(index: number) {
      walk(tree).filter(node => node.type === 'button' && node.props.title === 'apiKeyFun.keyManager.useKey')[index].props.onClick({stopPropagation() {}});
      flush();
    },
    close() {modal().props.onClose(); flush();},
  };
}

test('late models from a closed Key A dialog cannot overwrite Key B', async () => {
  const s = setup();
  s.open(0); s.close(); s.open(1);
  s.pending[1].resolve({models: [{id: 'claude-sonnet-4-6'}]});
  await settlePromises(); s.flush();
  s.pending[0].resolve({models: [{id: 'gpt-6.1-sol'}]});
  await settlePromises(); s.flush();
  assert.equal(s.modal().props.keyName, 'B');
  assert.deepEqual(Array.from(s.modal().props.models), ['claude-sonnet-4-6']);
  s.h.unmount();
});

test('an obsolete failure cannot clear the new dialog loading state or models', async () => {
  const s = setup();
  s.open(0); s.close(); s.open(1);
  s.pending[0].reject(new Error('old key rejected'));
  await settlePromises(); s.flush();
  assert.equal(s.modal().props.modelsLoading, true);
  s.pending[1].resolve({models: [{id: 'gpt-6-luna'}]});
  await settlePromises(); s.flush();
  assert.deepEqual(Array.from(s.modal().props.models), ['gpt-6-luna']);
  assert.equal(s.modal().props.modelsLoading, false);
  s.h.unmount();
});
