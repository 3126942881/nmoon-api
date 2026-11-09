import assert from "node:assert/strict";
import test from "node:test";

import {
  DEEPSEEK_API_BASE_URL,
  MINIMAX_API_PROVIDER_ID,
  MINIMAX_EN_API_PROVIDER_ID,
  codexApiProviderPresetVisionSupport,
  findCodexApiProviderPresetByBaseUrl,
  findCodexApiProviderPresetById,
} from "./codexProviderPresets.ts";
import { canConfigureCodexProviderVision, resolveCodexProviderCapabilityProfile } from "./codexProviderGateway.ts";

test("Anthropic uses the instance gateway and preserves its protocol", () => {
  const profile = resolveCodexProviderCapabilityProfile({ baseUrl: "https://example.invalid", wireApi: "anthropic" });
  assert.equal(profile.wireApi, "anthropic");
  assert.equal(profile.requiresGateway, true);
  assert.equal(profile.supportsDirect, false);
  assert.equal(profile.gatewayStrategy, "responses_to_anthropic");
});

test("third-party Responses providers expose preserved vision settings", () => {
  for (const presetId of ["custom", "packycode", "openrouter"]) {
    assert.equal(canConfigureCodexProviderVision({ presetId, wireApi: "responses" }), true);
  }
  for (const presetId of ["openai_official", "deepseek"]) {
    assert.equal(canConfigureCodexProviderVision({ presetId, wireApi: "responses" }), false);
  }
  assert.equal(canConfigureCodexProviderVision({ presetId: "deepseek", wireApi: "chat_completions" }), true);
});

test("third-party relays are not available as bundled presets", () => {
  for (const id of ["packycode", "cubence", "openrouter", "opencode_go", "siliconflow", "compshare", "pipellm"]) {
    assert.equal(findCodexApiProviderPresetById(id), null);
  }
  assert.equal(findCodexApiProviderPresetByBaseUrl("https://api.cubence.com/v1"), null);
});

test("DeepSeek keeps its native Responses default", () => {
  const profile = resolveCodexProviderCapabilityProfile({
    presetId: "deepseek",
    baseUrl: DEEPSEEK_API_BASE_URL,
  });

  assert.equal(profile.wireApi, "responses");
  assert.equal(resolveCodexProviderCapabilityProfile({ baseUrl: DEEPSEEK_API_BASE_URL, wireApi: "chat_completions" }).wireApi, "responses");
  assert.equal(resolveCodexProviderCapabilityProfile({ baseUrl: "https://relay.example/v1", presetId: "deepseek", wireApi: "chat_completions" }).wireApi, "chat_completions");
});

test("both MiniMax presets declare image input only for the vision-capable model", () => {
  [MINIMAX_API_PROVIDER_ID, MINIMAX_EN_API_PROVIDER_ID].forEach((presetId) => {
    const preset = findCodexApiProviderPresetById(presetId);

    assert.ok(preset);
    assert.deepEqual(preset.modelCatalog, ["MiniMax-M3", "MiniMax-M2.7"]);
    assert.deepEqual(preset.visionModelCatalog, ["MiniMax-M3"]);

    const support = codexApiProviderPresetVisionSupport(preset);
    assert.equal(support["minimax-m3"], true);
    assert.equal(support["minimax-m2.7"], undefined);
  });
});

test("presets without a declared vision catalog report no image support", () => {
  const preset = findCodexApiProviderPresetById("openai_official");

  assert.ok(preset);
  assert.deepEqual(codexApiProviderPresetVisionSupport(preset), {});
  assert.deepEqual(codexApiProviderPresetVisionSupport(null), {});
});
