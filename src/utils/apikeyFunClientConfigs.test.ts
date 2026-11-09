import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { APIKEY_FUN_FAMILIES, buildCodexConfigToml, buildClaudeCodeSettingsJson, buildApiKeyFunClientPreview, resolveDefaultModel } from './apikeyFunClientConfigs';
import { APIKEY_FUN_DEFAULT_MODEL_CATALOG } from './apikeyFunLinks';

const family = (id: string) => {
  const preset = APIKEY_FUN_FAMILIES.find((entry) => entry.id === id);
  assert.ok(preset, `missing family ${id}`);
  return preset;
};

test('client previews send Nmoon credentials only to the configured Nmoon endpoints', () => {
  for (const preset of APIKEY_FUN_FAMILIES) {
    const toml = buildCodexConfigToml({ family: preset, client: 'codex_cli', model: preset.fallbackModel });
    assert.ok(toml.includes('base_url = "https://ai.lmgai.cn/v1"'));
    assert.ok(!toml.includes('apikey.fan'));
    assert.ok(!toml.includes('x-openai-actor-authorization'));
  }
  const { env } = buildClaudeCodeSettingsJson({ apiKey: 'test-nmoon-key' });
  assert.equal(env.ANTHROPIC_BASE_URL, 'https://ai.lmgai.cn');
  assert.equal(env.ANTHROPIC_AUTH_TOKEN, 'test-nmoon-key');
});

test('Nmoon GPT defaults prefer supported GPT-6 IDs from the actual key catalog', () => {
  assert.equal(resolveDefaultModel(family('codex'), ['gpt-6-sol', 'gpt-6.1-sol']), 'gpt-6.1-sol');
  assert.equal(resolveDefaultModel(family('codex'), ['gpt-6-luna']), 'gpt-6-luna');
  assert.equal(resolveDefaultModel(family('codex'), ['custom/gpt-my-model']), 'custom/gpt-my-model');
});

test('codex config derives the auto compact limit as 90% of the context window', () => {
  const catalog = JSON.parse(readFileSync(new URL('../../resources/codex/codex_client_models.json', import.meta.url), 'utf8'));
  const codexTemplate = catalog.models.find((model: { slug: string }) => model.slug === family('codex').fallbackModel);
  assert.ok(codexTemplate, 'Codex family model template');
  for (const [id, contextWindow] of [
    ['codex', codexTemplate.context_window],
    ['glm', 1000000],
    ['kimi', 1000000],
    ['deepseek', 1000000],
  ] as const) {
    const toml = buildCodexConfigToml({
      family: family(id),
      client: 'codex_cli',
      model: family(id).fallbackModel,
    });
    const expected = Math.floor((contextWindow * 90) / 100);
    assert.ok(toml.includes(`model_context_window = ${contextWindow}`), id);
    assert.ok(toml.includes(`model_auto_compact_token_limit = ${expected}`), id);
    // 压缩阈值必须严格小于上下文窗口，否则永远不会触发压缩。
    assert.ok(expected < contextWindow, id);
  }
});

test('GPT-6 preview budgets match the shared backend catalog for the selected model', () => {
  const { models } = JSON.parse(readFileSync(new URL('../../resources/codex/codex_client_models.json', import.meta.url), 'utf8'));
  for (const id of ['gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra']) {
    const expected = models.find((entry: { slug: string }) => entry.slug === id);
    for (const model of [id, `provider/${id}`, `${id}-2026-03-05`]) {
      const toml = buildCodexConfigToml({ family: family('codex'), client: 'codex_app', model });
      assert.ok(toml.includes(`model = "${model}"`));
      assert.ok(toml.includes(`model_context_window = ${expected.context_window}\n`), model);
      assert.ok(toml.includes(`model_auto_compact_token_limit = ${Math.floor(expected.context_window * 0.9)}\n`), model);
    }
  }
});

test('Claude Code JSON and Windows commands both contain the selected model', () => {
  for (const model of ['claude-sonnet-4-6', 'claude-opus-4-7', 'custom/claude-model']) {
    const preview = buildApiKeyFunClientPreview({ family: family('claude'), client: 'claude_code', apiKey: 'test-key', model, platform: 'windows' });
    const config = JSON.parse(preview.blocks.find(block => block.language === 'json')!.text);
    assert.equal(config.env.ANTHROPIC_MODEL, model);
    assert.equal(config.env.ANTHROPIC_BASE_URL, 'https://ai.lmgai.cn');
    const commands = preview.blocks.find(block => block.language === 'bat')!.text;
    assert.ok(commands.includes(`ANTHROPIC_MODEL=${model}`));
    assert.ok(commands.includes(`$env:ANTHROPIC_MODEL="${model}"`));
  }
});

test('built-in Codex templates prefer current models while preserving explicit upstream catalogs', () => {
  const preset = family('codex');
  assert.equal(resolveDefaultModel(preset, []), 'gpt-6.1-terra');
  assert.equal(resolveDefaultModel(preset, ['gpt-5.5', 'gpt-5.6-sol']), 'gpt-5.6-sol');
  assert.equal(resolveDefaultModel(preset, ['custom-gpt', 'gpt-5.5']), 'gpt-5.5');
  assert.equal(resolveDefaultModel(preset, ['gpt-5.4', 'gpt-5.5']), 'gpt-5.4');
  assert.ok(!preset.preferredModels.includes('gpt-5.5'));
  assert.ok(!APIKEY_FUN_DEFAULT_MODEL_CATALOG.some((model) => model === ('gpt-5.5' as string)));
  assert.ok(buildCodexConfigToml({ family: preset, client: 'codex_app', model: 'gpt-5.5' })
    .includes('model = "gpt-5.5"'));
});

test('Grok template prefers 4.7 only when the upstream catalog offers it', () => {
  const preset = family('grok');
  assert.equal(resolveDefaultModel(preset, []), 'grok-4.7');
  assert.equal(resolveDefaultModel(preset, ['grok-4.6', 'grok-4.7']), 'grok-4.7');
  assert.equal(resolveDefaultModel(preset, ['grok-4.6']), 'grok-4.6');
  assert.equal(resolveDefaultModel(preset, ['custom-grok']), 'custom-grok');
  assert.ok(!preset.preferredModels.includes('grok-4.7-build-fast'));
  assert.ok(buildCodexConfigToml({ family: preset, client: 'codex_cli', model: 'grok-4.6' })
    .includes('model = "grok-4.6"'));
});
