import assert from 'node:assert/strict';
import test from 'node:test';
import {loadHookModule} from '../../../tests/helpers/reactHookHarness';

function walk(node: any): any[] {
  return Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
}

test('a mixed Key can switch families, restrict model choices and generate the selected Claude config', () => {
  const t = (key: string) => key;
  const Select = () => null;
  const models = ['gpt-6.1-sol', 'gpt-6-sol', 'claude-sonnet-4-6', 'claude-opus-4-7'];
  const h = loadHookModule(new URL('./ApiKeyFunKeyConfigModal.tsx', import.meta.url), {
    'react-i18next': {useTranslation: () => ({t})}, '../SingleSelectDropdown': {SingleSelectDropdown: Select},
  }, {navigator: {userAgent: 'Windows'}, window: {setTimeout() {}}});
  let tree = h.render(() => h.exports.ApiKeyFunKeyConfigModal({keyName: 'fixture', apiKey: 'synthetic', models, modelsLoading: false, onClose() {}}));
  const selects = () => walk(tree).filter(node => node.type === Select);
  const familyPicker = () => selects().find(node => node.props.options.some((option: any) => option.value === 'codex'));
  const modelPicker = () => selects().find(node => node !== familyPicker());
  assert.ok(familyPicker(), 'mixed keys need an editable family picker');
  familyPicker().props.onChange('claude'); tree = h.flush();
  assert.deepEqual(Array.from(modelPicker().props.options, (option: any) => option.value), ['claude-sonnet-4-6', 'claude-opus-4-7']);
  const clients = walk(tree).filter(node => node.type === 'button' && node.props.className?.includes('apikey-fun-config-client'));
  assert.deepEqual(clients.map(node => node.props.children), ['Claude Code', 'Claude Desktop']);
  modelPicker().props.onChange('claude-sonnet-4-6'); tree = h.flush();
  const config = walk(tree).find(node => node.type === 'pre' && node.props.className.includes('language-json'));
  assert.equal(JSON.parse(config.props.children).env.ANTHROPIC_MODEL, 'claude-sonnet-4-6');
  familyPicker().props.onChange('codex'); tree = h.flush();
  assert.deepEqual(Array.from(modelPicker().props.options, (option: any) => option.value), ['gpt-6.1-sol', 'gpt-6-sol']);
  const toml = walk(tree).find(node => node.type === 'pre' && node.props.className.includes('language-toml')).props.children;
  assert.ok(toml.includes('model = "gpt-6.1-sol"'));
  h.unmount();
});
