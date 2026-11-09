export interface CodexApiProviderPreset {
  id: string;
  name: string;
  baseUrls: string[];
  modelCatalog?: string[];
  /**
   * Models from `modelCatalog` that accept image input. Models that are left out
   * fall back to the provider-level default, so a preset can describe a catalog
   * that mixes vision-capable and text-only models.
   */
  visionModelCatalog?: string[];
  website?: string;
  apiKeyUrl?: string;
  isOfficial?: boolean;
  isPartner?: boolean;
  isService?: boolean;
}

export const CODEX_API_PROVIDER_CUSTOM_ID = "custom";
export const COCKPIT_API_PROVIDER_ID = "cockpit_api";
export const COCKPIT_API_PROVIDER_NAME = "Cockpit Api";
export const COCKPIT_API_BASE_URL = "https://chongcodex.cn/v1";
export const DEEPSEEK_API_PROVIDER_ID = "deepseek";
export const DEEPSEEK_API_BASE_URL = "https://api.deepseek.com";
export const DEEPSEEK_CODEX_MODEL_CATALOG = [
  "deepseek-flash",
  "deepseek-v4-pro",
] as const;
/**
 * DeepSeek's image-capable models. `deepseek-v4-flash` 与官方新名 `deepseek-flash`
 * 都由 V4.1 Flash 承接并支持识图，Pro 仍为纯文本。用户可在模型列表里逐条开关。
 */
export const DEEPSEEK_CODEX_VISION_MODEL_CATALOG = [
  "deepseek-flash",
  "deepseek-v4-flash",
  "deepseek-v4-flash-vision-exp",
] as const;
export const OPENCODE_GO_API_PROVIDER_ID = "opencode_go";
export const OPENCODE_GO_API_BASE_URL = "https://opencode.ai/zen/go/v1";
export const MINIMAX_API_PROVIDER_ID = "minimax";
export const MINIMAX_EN_API_PROVIDER_ID = "minimax_en";
export const MINIMAX_CODEX_MODEL_CATALOG = [
  "MiniMax-M3",
  "MiniMax-M2.7",
] as const;
/** MiniMax models whose published input modalities include images. */
export const MINIMAX_CODEX_VISION_MODEL_CATALOG = ["MiniMax-M3"] as const;
/** OpenCode Go models exposed through its OpenAI-compatible chat completions API. */
export const OPENCODE_GO_CODEX_MODEL_CATALOG = [
  "minimax-m3",
  "minimax-m2.7",
  "minimax-m2.5",
  "kimi-k3",
  "kimi-k2.7-code",
  "kimi-k2.6",
  "kimi-k2.5",
  "glm-5.2",
  "glm-5.3",
  "glm-5.1",
  "glm-5",
  "deepseek-v4-pro",
  "deepseek-v4-flash",
  "qwen3.7-max",
  "qwen3.8-max",
  "qwen3.7-plus",
  "qwen3.6-plus",
  "qwen3.5-plus",
  "mimo-v2-pro",
  "mimo-v2-omni",
  "mimo-v2.5-pro",
  "mimo-v2.5",
  "hy3",
  "hy3-preview",
  "gpt-5.6-luna",
  "grok-4.5",
] as const;

const COCKPIT_API_HIDDEN_BASE_URLS = [COCKPIT_API_BASE_URL] as const;

export const CODEX_API_PROVIDER_PRESETS: readonly CodexApiProviderPreset[] = [
  {
    id: "openai_official",
    name: "OpenAI Official",
    baseUrls: ["https://api.openai.com/v1"],
    website: "https://chatgpt.com/codex",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    isOfficial: true,
  },
  {
    id: "azure_openai",
    name: "Azure OpenAI",
    baseUrls: ["https://YOUR_RESOURCE_NAME.openai.azure.com/openai"],
    website:
      "https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/codex",
    isOfficial: true,
  },
  {
    id: DEEPSEEK_API_PROVIDER_ID,
    name: "DeepSeek",
    baseUrls: [DEEPSEEK_API_BASE_URL, `${DEEPSEEK_API_BASE_URL}/v1`],
    modelCatalog: [...DEEPSEEK_CODEX_MODEL_CATALOG],
    visionModelCatalog: [...DEEPSEEK_CODEX_VISION_MODEL_CATALOG],
    website: "https://platform.deepseek.com/",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "moonshot",
    name: "Moonshot",
    baseUrls: ["https://api.moonshot.cn/v1"],
    modelCatalog: ["kimi-k2.6"],
    website: "https://platform.moonshot.cn/",
  },
  {
    id: "zhipu_glm",
    name: "Zhipu GLM",
    baseUrls: ["https://open.bigmodel.cn/api/coding/paas/v4"],
    modelCatalog: ["glm-5.1"],
    website: "https://open.bigmodel.cn",
    apiKeyUrl: "https://www.bigmodel.cn/claude-code",
  },
  {
    id: "zhipu_glm_en",
    name: "Zhipu GLM en",
    baseUrls: ["https://api.z.ai/api/coding/paas/v4"],
    modelCatalog: ["glm-5.1"],
    website: "https://z.ai",
    apiKeyUrl: "https://z.ai/subscribe",
  },
  {
    id: "volcengine_agentplan",
    name: "火山Agentplan",
    baseUrls: ["https://ark.cn-beijing.volces.com/api/coding/v3"],
    website: "https://www.volcengine.com/product/ark",
  },
  {
    id: "byteplus",
    name: "BytePlus",
    baseUrls: ["https://ark.ap-southeast.bytepluses.com/api/coding/v3"],
    website: "https://www.byteplus.com/en/product/ark",
  },
  {
    id: "doubaoseed",
    name: "DouBaoSeed",
    baseUrls: ["https://ark.cn-beijing.volces.com/api/v3"],
    website: "https://www.volcengine.com/product/ark",
  },
  {
    id: "qianfan_coding",
    name: "Baidu Qianfan Coding Plan",
    baseUrls: ["https://qianfan.baidubce.com/v2/coding"],
    website: "https://qianfan.cloud.baidu.com/",
  },
  {
    id: "bailian",
    name: "Bailian",
    baseUrls: ["https://dashscope.aliyuncs.com/compatible-mode/v1"],
    website: "https://bailian.console.aliyun.com/",
  },
  {
    id: "stepfun",
    name: "StepFun",
    baseUrls: ["https://api.stepfun.com/step_plan/v1"],
    website: "https://platform.stepfun.com/",
  },
  {
    id: "stepfun_en",
    name: "StepFun en",
    baseUrls: ["https://api.stepfun.ai/step_plan/v1"],
    website: "https://platform.stepfun.ai/",
  },
  {
    id: "modelscope",
    name: "ModelScope",
    baseUrls: ["https://api-inference.modelscope.cn/v1"],
    website: "https://modelscope.cn/",
  },
  {
    id: "longcat",
    name: "Longcat",
    baseUrls: ["https://api.longcat.chat/openai/v1"],
    website: "https://longcat.chat/",
  },
  {
    id: MINIMAX_API_PROVIDER_ID,
    name: "MiniMax",
    baseUrls: ["https://api.minimaxi.com/v1"],
    modelCatalog: [...MINIMAX_CODEX_MODEL_CATALOG],
    visionModelCatalog: [...MINIMAX_CODEX_VISION_MODEL_CATALOG],
    website: "https://platform.minimaxi.com/docs",
  },
  {
    id: MINIMAX_EN_API_PROVIDER_ID,
    name: "MiniMax en",
    baseUrls: ["https://api.minimax.io/v1"],
    modelCatalog: [...MINIMAX_CODEX_MODEL_CATALOG],
    visionModelCatalog: [...MINIMAX_CODEX_VISION_MODEL_CATALOG],
    website: "https://platform.minimax.io/docs",
  },
  {
    id: "bailing",
    name: "BaiLing",
    baseUrls: ["https://api.tbox.cn/api/llm/v1"],
    website: "https://www.tbox.cn/",
  },
  {
    id: "xiaomi_mimo",
    name: "Xiaomi MiMo",
    baseUrls: ["https://api.xiaomimimo.com/v1"],
    website: "https://www.xiaomimimo.com/",
  },
  {
    id: "xiaomi_mimo_token_plan",
    name: "Xiaomi MiMo Token Plan",
    baseUrls: ["https://token-plan-cn.xiaomimimo.com/v1"],
    website: "https://www.xiaomimimo.com/",
  },
  {
    id: "nvidia",
    name: "Nvidia",
    baseUrls: ["https://integrate.api.nvidia.com/v1"],
    website: "https://build.nvidia.com/",
  },
];

function normalizeCodexProviderBaseUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    return `${parsed.origin}${parsed.pathname}`
      .replace(/\/+$/, "")
      .toLowerCase();
  } catch {
    return null;
  }
}

export function findCodexApiProviderPresetById(
  id: string,
): CodexApiProviderPreset | null {
  return CODEX_API_PROVIDER_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function findCodexApiProviderPresetByBaseUrl(
  rawBaseUrl: string,
): CodexApiProviderPreset | null {
  const normalized = normalizeCodexProviderBaseUrl(rawBaseUrl);
  if (!normalized) return null;

  return (
    CODEX_API_PROVIDER_PRESETS.find((preset) =>
      preset.baseUrls.some(
        (baseUrl) => normalizeCodexProviderBaseUrl(baseUrl) === normalized,
      ),
    ) ?? null
  );
}

export function isCockpitApiProviderBaseUrl(rawBaseUrl: string): boolean {
  const normalized = normalizeCodexProviderBaseUrl(rawBaseUrl);
  if (!normalized) return false;
  return COCKPIT_API_HIDDEN_BASE_URLS.some(
    (baseUrl) => normalizeCodexProviderBaseUrl(baseUrl) === normalized,
  );
}

export function resolveCodexApiProviderPresetId(rawBaseUrl: string): string {
  return (
    findCodexApiProviderPresetByBaseUrl(rawBaseUrl)?.id ??
    CODEX_API_PROVIDER_CUSTOM_ID
  );
}

/**
 * Per-model image input support declared by a preset, keyed the same way the
 * stored provider and account capability maps are keyed (trimmed, lowercased).
 */
export function codexApiProviderPresetVisionSupport(
  preset: CodexApiProviderPreset | null | undefined,
): Record<string, boolean> {
  const support: Record<string, boolean> = {};
  (preset?.visionModelCatalog ?? []).forEach((model) => {
    const key = model.trim().toLowerCase();
    if (key) support[key] = true;
  });
  return support;
}
