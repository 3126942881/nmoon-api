import assert from "node:assert/strict";
import test from "node:test";

import {
  APIKEY_FUN_GLOBAL_ENDPOINT,
  APIKEY_FUN_DEFAULT_MODEL_CATALOG,
  mergeApiKeyFunModelCatalog,
  APIKEY_FUN_PROVIDER_BASE_URL,
  APIKEY_FUN_REGISTER_URL,
  isApiKeyFunProviderBaseUrl,
  normalizeApiKeyFunOfficialUrl,
  normalizeApiKeyFunProviderBaseUrl,
  resolveApiKeyFunWireApi,
} from "./apikeyFunLinks.ts";
import { getModelDisplayName } from "./modelNames.ts";

test("nmoon exposes GPT-6.1 Sol in its model catalog", () => {
  assert.ok(APIKEY_FUN_DEFAULT_MODEL_CATALOG.includes("gpt-6.1-sol"));
  assert.ok(APIKEY_FUN_DEFAULT_MODEL_CATALOG.includes("gpt-6-sol"));
  assert.ok(APIKEY_FUN_DEFAULT_MODEL_CATALOG.includes("gpt-6-luna"));
  assert.equal(getModelDisplayName("gpt-6.1-sol"), "GPT-6.1 Sol");
  assert.deepEqual(
    mergeApiKeyFunModelCatalog(["custom-model", "GPT-6.1-SOL"]),
    ["custom-model", "GPT-6.1-SOL"],
  );
  assert.deepEqual(mergeApiKeyFunModelCatalog(["custom-model"]), ["custom-model"]);
  assert.deepEqual(mergeApiKeyFunModelCatalog([]), []);
  assert.deepEqual(mergeApiKeyFunModelCatalog(), [...APIKEY_FUN_DEFAULT_MODEL_CATALOG]);
});

test("nmoon preset points to the configured website and API", () => {
  assert.equal(APIKEY_FUN_REGISTER_URL, "https://ai.lmgai.cn/register");
  assert.equal(APIKEY_FUN_GLOBAL_ENDPOINT, "https://ai.lmgai.cn");
  assert.equal(APIKEY_FUN_PROVIDER_BASE_URL, "https://ai.lmgai.cn/v1");
});

test("registration normalization does not redirect other providers", () => {
  assert.equal(normalizeApiKeyFunOfficialUrl("https://ai.lmgai.cn/"), APIKEY_FUN_REGISTER_URL);
  for (const url of ["https://apikey.fun/", "https://apikey.fan/register", "https://relay.example.com/register"]) {
    assert.equal(normalizeApiKeyFunOfficialUrl(url), url);
  }
});

test("provider recognition is limited to the configured API origin and path", () => {
  assert.equal(isApiKeyFunProviderBaseUrl("https://ai.lmgai.cn/v1/"), true);
  for (const url of ["https://api.apikey.fan/v1", "https://api.apikey.fun/v1", "https://ai.lmgai.cn/v2", "https://ai.lmgai.cn:8443/v1", "https://ai.lmgai.cn.example.com/v1"]) {
    assert.equal(isApiKeyFunProviderBaseUrl(url), false);
  }
});

test("normalization preserves old providers instead of moving their keys to nmoon", () => {
  assert.equal(normalizeApiKeyFunProviderBaseUrl(" https://ai.lmgai.cn/v1/ "), APIKEY_FUN_PROVIDER_BASE_URL);
  for (const url of ["https://api.apikey.fun/v1", "https://api.apikey.fan/v1", "https://relay.example.com/v1"]) {
    assert.equal(normalizeApiKeyFunProviderBaseUrl(url), url);
  }
});

test("Responses is selected only for nmoon; custom provider protocols are preserved", () => {
  assert.equal(resolveApiKeyFunWireApi(APIKEY_FUN_PROVIDER_BASE_URL, "chat_completions"), "responses");
  assert.equal(resolveApiKeyFunWireApi("https://relay.example.com/v1", "chat_completions"), "chat_completions");
});
