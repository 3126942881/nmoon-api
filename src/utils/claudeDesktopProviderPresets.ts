import type {
  ClaudeDesktopGatewayConnectionMode,
  ClaudeDesktopGatewayModelMapping,
} from '../types/claude';
import {
  APIKEY_FUN_GLOBAL_ENDPOINT,
  APIKEY_FUN_REGISTER_URL,
  APIKEY_FUN_SOURCE_TAG,
} from './apikeyFunLinks';

export type ClaudeDesktopGatewayAuthScheme = 'bearer' | 'x-api-key' | 'auto';
export type ClaudeDesktopGatewayApiKeyField = 'ANTHROPIC_AUTH_TOKEN' | 'ANTHROPIC_API_KEY';

export interface ClaudeDesktopGatewayProviderPreset {
  id: string;
  name: string;
  baseUrls: string[];
  authScheme: ClaudeDesktopGatewayAuthScheme;
  apiKeyField?: ClaudeDesktopGatewayApiKeyField;
  connectionMode: ClaudeDesktopGatewayConnectionMode;
  website?: string;
  apiKeyUrl?: string;
  isOfficial?: boolean;
  isPartner?: boolean;
  sourceTag?: string;
  modelMappings: ClaudeDesktopGatewayModelMapping[];
}

export const CLAUDE_DESKTOP_GATEWAY_PROVIDER_CUSTOM_ID = 'custom';
export const CLAUDE_DESKTOP_GATEWAY_APIKEY_FUN_PROVIDER_ID = 'nmoon';

export const CLAUDE_DESKTOP_GATEWAY_DEFAULT_MODELS = [
  'claude-opus-4-8',
  'claude-fable-5',
  'claude-opus-4-7',
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-haiku-4-5',
] as const;

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim() ?? '').filter(Boolean)));
}

function createRoute(
  desktopModel: string,
  upstreamModel: string,
  options: {
    labelOverride?: string | null;
    supports1m?: boolean;
  } = {},
): ClaudeDesktopGatewayModelMapping {
  return {
    desktopModel,
    upstreamModel,
    ...(options.labelOverride?.trim() ? { labelOverride: options.labelOverride.trim() } : {}),
    ...(options.supports1m ? { supports1m: true } : {}),
  };
}

function directRoutes(
  models: readonly string[] = CLAUDE_DESKTOP_GATEWAY_DEFAULT_MODELS,
  options: { supports1m?: boolean } = {},
): ClaudeDesktopGatewayModelMapping[] {
  return uniqueNonEmpty([...models]).map((model) => ({
    desktopModel: model,
    upstreamModel: model,
    ...(options.supports1m ? { supports1m: true } : {}),
  }));
}

function brandedRoutes(
  sonnet: string,
  opus: string,
  haiku: string,
  options: { supports1m?: boolean } = {},
): ClaudeDesktopGatewayModelMapping[] {
  const seen = new Set<string>();
  return [
    ['claude-sonnet-4-6', sonnet],
    ['claude-opus-4-8', opus],
    ['claude-haiku-4-5', haiku],
  ]
    .map(([desktopModel, upstreamModel]) =>
      createRoute(desktopModel, upstreamModel, {
        labelOverride: upstreamModel,
        supports1m: options.supports1m,
      }),
    )
    .filter((mapping) => {
      const upstreamKey = mapping.upstreamModel.trim().toLowerCase();
      if (!upstreamKey || seen.has(upstreamKey)) return false;
      seen.add(upstreamKey);
      return true;
    });
}

function repeatedMappedRoute(
  upstreamModel: string,
  options: { supports1m?: boolean } = {},
): ClaudeDesktopGatewayModelMapping[] {
  return brandedRoutes(upstreamModel, upstreamModel, upstreamModel, options);
}

export const CLAUDE_DESKTOP_GATEWAY_PROVIDER_PRESETS: readonly ClaudeDesktopGatewayProviderPreset[] = [
  {
    id: CLAUDE_DESKTOP_GATEWAY_APIKEY_FUN_PROVIDER_ID,
    name: '小月神api',
    baseUrls: [APIKEY_FUN_GLOBAL_ENDPOINT],
    authScheme: 'bearer',
    connectionMode: 'direct',
    website: 'https://ai.lmgai.cn',
    apiKeyUrl: APIKEY_FUN_REGISTER_URL,
    isPartner: true,
    sourceTag: APIKEY_FUN_SOURCE_TAG,
    modelMappings: directRoutes(),
  },
  {
    id: 'anthropic_official',
    name: 'Anthropic Official',
    baseUrls: ['https://api.anthropic.com'],
    authScheme: 'x-api-key',
    apiKeyField: 'ANTHROPIC_API_KEY',
    connectionMode: 'direct',
    website: 'https://www.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    isOfficial: true,
    modelMappings: directRoutes(),
  },
  {
    id: 'volcengine_agentplan',
    name: '火山Agentplan',
    baseUrls: ['https://ark.cn-beijing.volces.com/api/coding'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://www.volcengine.com/activity/codingplan',
    apiKeyUrl: 'https://www.volcengine.com/activity/codingplan',

    modelMappings: repeatedMappedRoute('ark-code-latest'),
  },
  {
    id: 'byteplus',
    name: 'BytePlus',
    baseUrls: ['https://ark.ap-southeast.bytepluses.com/api/coding'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://www.byteplus.com/en/product/modelark',
    apiKeyUrl: 'https://www.byteplus.com/en/product/modelark',

    modelMappings: repeatedMappedRoute('ark-code-latest'),
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrls: ['https://api.deepseek.com/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.deepseek.com',
    modelMappings: brandedRoutes(
      'deepseek-v4-pro',
      'deepseek-v4-pro',
      'deepseek-v4-flash',
    ),
  },
  {
    id: 'kimi',
    name: 'Kimi',
    baseUrls: ['https://api.moonshot.cn/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.moonshot.cn/console',

    modelMappings: repeatedMappedRoute('kimi-k2.7-code'),
  },
  {
    id: 'kimi_coding',
    name: 'Kimi For Coding',
    baseUrls: ['https://api.kimi.com/coding'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://www.kimi.com/code/docs/',

    modelMappings: directRoutes(),
  },
  {
    id: 'zhipu_glm',
    name: 'Zhipu GLM',
    baseUrls: ['https://open.bigmodel.cn/api/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://open.bigmodel.cn',
    apiKeyUrl: 'https://www.bigmodel.cn/claude-code',
    modelMappings: repeatedMappedRoute('glm-5.1'),
  },
  {
    id: 'zhipu_glm_global',
    name: 'Zhipu GLM en',
    baseUrls: ['https://api.z.ai/api/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://z.ai',
    apiKeyUrl: 'https://z.ai/subscribe',
    modelMappings: repeatedMappedRoute('glm-5.1'),
  },
  {
    id: 'baidu_qianfan_coding',
    name: 'Baidu Qianfan Coding Plan',
    baseUrls: ['https://qianfan.baidubce.com/anthropic/coding'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://cloud.baidu.com/product/qianfan_modelbuilder',
    apiKeyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    modelMappings: repeatedMappedRoute('qianfan-code-latest'),
  },
  {
    id: 'bailian',
    name: 'Bailian',
    baseUrls: ['https://dashscope.aliyuncs.com/apps/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://bailian.console.aliyun.com',
    modelMappings: directRoutes(),
  },
  {
    id: 'bailian_coding',
    name: 'Bailian For Coding',
    baseUrls: ['https://coding.dashscope.aliyuncs.com/apps/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://bailian.console.aliyun.com',
    modelMappings: directRoutes(),
  },
  {
    id: 'stepfun',
    name: 'StepFun',
    baseUrls: ['https://api.stepfun.com/step_plan'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.stepfun.com/step-plan',
    apiKeyUrl: 'https://platform.stepfun.com/interface-key',
    modelMappings: repeatedMappedRoute('step-3.5-flash-2603'),
  },
  {
    id: 'stepfun_global',
    name: 'StepFun en',
    baseUrls: ['https://api.stepfun.ai/step_plan'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.stepfun.ai/step-plan',
    apiKeyUrl: 'https://platform.stepfun.ai/interface-key',
    modelMappings: repeatedMappedRoute('step-3.5-flash-2603'),
  },
  {
    id: 'modelscope',
    name: 'ModelScope',
    baseUrls: ['https://api-inference.modelscope.cn'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://modelscope.cn',
    modelMappings: repeatedMappedRoute('ZhipuAI/GLM-5.1'),
  },
  {
    id: 'longcat',
    name: 'Longcat',
    baseUrls: ['https://api.longcat.chat/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://longcat.chat/platform',
    apiKeyUrl: 'https://longcat.chat/platform/api_keys',
    modelMappings: repeatedMappedRoute('LongCat-Flash-Chat'),
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrls: ['https://api.minimaxi.com/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.minimaxi.com/docs',
    apiKeyUrl: 'https://platform.minimaxi.com/subscribe/coding-plan',
    modelMappings: [
      createRoute('claude-sonnet-4-6', 'MiniMax-M3', {
        labelOverride: 'MiniMax-M3',
        supports1m: true,
      }),
      createRoute('claude-haiku-4-5', 'MiniMax-M2.7', {
        labelOverride: 'MiniMax-M2.7',
      }),
    ],
  },
  {
    id: 'minimax_global',
    name: 'MiniMax en',
    baseUrls: ['https://api.minimax.io/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.minimax.io/docs',
    apiKeyUrl: 'https://platform.minimax.io/subscribe/coding-plan',
    modelMappings: [
      createRoute('claude-sonnet-4-6', 'MiniMax-M3', {
        labelOverride: 'MiniMax-M3',
        supports1m: true,
      }),
      createRoute('claude-haiku-4-5', 'MiniMax-M2.7', {
        labelOverride: 'MiniMax-M2.7',
      }),
    ],
  },
  {
    id: 'bailing',
    name: 'BaiLing',
    baseUrls: ['https://api.tbox.cn/api/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://alipaytbox.yuque.com/sxs0ba/ling/get_started',
    modelMappings: repeatedMappedRoute('Ling-2.5-1T'),
  },
  {
    id: 'xiaomi_mimo',
    name: 'Xiaomi MiMo',
    baseUrls: ['https://api.xiaomimimo.com/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.xiaomimimo.com',
    apiKeyUrl: 'https://platform.xiaomimimo.com/#/console/api-keys',
    modelMappings: repeatedMappedRoute('mimo-v2.5-pro'),
  },
  {
    id: 'xiaomi_mimo_token_plan_cn',
    name: 'Xiaomi MiMo Token Plan (China)',
    baseUrls: ['https://token-plan-cn.xiaomimimo.com/anthropic'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://platform.xiaomimimo.com/#/token-plan',
    apiKeyUrl: 'https://platform.xiaomimimo.com/#/console/plan-manage',
    modelMappings: repeatedMappedRoute('mimo-v2.5-pro'),
  },
  {
    id: 'doubaoseed',
    name: 'DouBaoSeed',
    baseUrls: ['https://ark.cn-beijing.volces.com/api/compatible'],
    authScheme: 'bearer',
    connectionMode: 'local_mapping',
    website: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    apiKeyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',

    modelMappings: repeatedMappedRoute('doubao-seed-2-0-code-preview-latest'),
  },
];

export function getDefaultClaudeDesktopGatewayProviderPresetId(): string {
  return CLAUDE_DESKTOP_GATEWAY_APIKEY_FUN_PROVIDER_ID;
}

export function findClaudeDesktopGatewayProviderPresetById(
  id?: string | null,
): ClaudeDesktopGatewayProviderPreset | null {
  if (!id) return null;
  return CLAUDE_DESKTOP_GATEWAY_PROVIDER_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function inferClaudeDesktopGatewayApiKeyField(
  preset?: ClaudeDesktopGatewayProviderPreset | null,
  authScheme?: ClaudeDesktopGatewayAuthScheme | string | null,
): ClaudeDesktopGatewayApiKeyField {
  if (preset?.apiKeyField) return preset.apiKeyField;
  return authScheme?.trim().toLowerCase() === 'x-api-key'
    ? 'ANTHROPIC_API_KEY'
    : 'ANTHROPIC_AUTH_TOKEN';
}
