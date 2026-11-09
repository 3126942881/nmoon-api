# 小月神api 定制版

- 网站：https://ai.lmgai.cn
- 注册：https://ai.lmgai.cn/register
- Codex API Base URL：https://ai.lmgai.cn/v1
- Claude API Base URL：https://ai.lmgai.cn
- 额度查询：Sub2API；模型列表从用户的 API Key 读取。

中转站页面、侧栏和仪表盘使用本地月亮图标 `src/assets/icons/nmoon.svg`。原项目作者信息保留。

## 配置与更新

`announcements.json` 和 `remote-config.json` 通过 Rust 的 `include_str!` 编译进安装包，开发版和正式版均不再请求原作者的远程配置，也不使用旧配置缓存或本地覆盖文件。中转站配置主要位于 `announcements.json`；默认地址与注册入口位于 `src/utils/apikeyFunLinks.ts`，内部导出名称暂保留以减少无关重构。

此版本关闭启动、定时和手动在线更新检查，以及 Linux 在线安装入口。Tauri updater 的 endpoints 为空，createUpdaterArtifacts 为 false；更新设置显示为关闭。后续调整源码、提升版本号后重新构建安装包，由站长发布，用户手动安装。

小月神api 使用独立的 `nmoon` 供应商标识和 `nmoon_managed_keys` 密钥存储，不会把原站点已保存的密钥或账号自动迁移到新域名。原站历史账号的兼容代码仍然保留。

## 验证与构建

```sh
npm ci
npm run typecheck
node node_modules/tsx/dist/cli.mjs --test src/utils/apikeyFunLinks.test.ts src/utils/codexProviderPresets.test.ts
npm run build
```

桌面安装包还需要 Rust/Cargo、平台构建依赖及项目要求的 sidecar 构建环境。环境就绪后使用项目原有的 `npm run tauri build` 流程。

本机已完成 Windows x64 Release 编译及 NSIS 打包，试用安装包位于 `release-nmoon/NmoonAPI_1.3.56_x64-setup.exe`，同目录提供试用说明与 SHA-256 校验值。本机使用 `C:\BuildTools` 中的 MSVC，重新打包可执行 `.build-tools/build-windows.cmd`；完整构建日志位于 `.build-tools/windows-build.log`。安装包沿用 Cockpit Tools 的应用标识，尚未进行实际安装启动测试。

## 1.3.57 供应商清理

Codex、Claude CLI 与 Claude 桌面端的内置供应商列表仅保留模型厂商、官方云平台接口与小月神api，自定义入口继续可用。移除了 PackyCode、Cubence 等第三方中转站，以及 OpenRouter、OpenCode Go、SiliconFlow 等第三方聚合平台；官方预设链接中的推广参数也已清理。本次不删除用户自己保存的账号、密钥和供应商。

新版安装包为 `release-nmoon/NmoonAPI_1.3.57_x64-setup.exe`，对应构建日志为 `.build-tools/windows-build-1.3.57.log`。

## 1.3.58 关于页入口

设置页的四张卡片调整为：联系客服（QQ 37579735）、点击进群（QQ群 1108278250）、进入中转站和关于。进群使用站长提供的 QQ 群分享链接；客服使用 QQ 协议唤起联系窗口。两个联系入口均提供号码复制，QQ 没有启动时可手动搜索。

“进入中转站”打开 https://ai.lmgai.cn；“关于”显示定制版版本、联系方式、原作者及原项目链接。原供应商清理和关闭在线更新的设置保留。

安装包：`release-nmoon/NmoonAPI_1.3.58_x64-setup.exe`。构建日志：`.build-tools/windows-build-1.3.58.log`。

中文安装包：`release-nmoon/NmoonAPI_1.3.58_zh-CN_x64-setup.exe`。NSIS 安装及卸载向导固定使用简体中文（`SimpChinese`），无需选择语言。本次仅重新打包，应用版本仍为 1.3.58；打包日志为 `.build-tools/windows-bundle-1.3.58-zh-CN.log`。

未提供有效 API Key 时，只能确认 API 路径的鉴权响应，无法验证账户余额、实际模型列表和推理请求。

## Linux 与 macOS 打包

跨平台构建命令、私有 GitHub 仓库和安装方法见 [NMOON-CROSS-PLATFORM.md](NMOON-CROSS-PLATFORM.md)。Linux 目标为 Ubuntu 24.04 x64 的 DEB 与 AppImage；Mac 分别构建 Apple 芯片和 Intel 的 DMG。应用仍为 1.3.58，在线更新保持关闭。

## 1.3.59 GPT-6.1 Sol

小月神api 模型目录加入 `gpt-6.1-sol`，显示名称为 `GPT-6.1 Sol`。Windows 中文安装包为 `release-nmoon/NmoonAPI_1.3.59_zh-CN_x64-setup.exe`。该模型仍需要小月神api网关和当前 API Key 实际开放；若网关未开放，调用会返回对应的模型不可用错误。

截图中的“API 服务”使用本地网关目录，已同步加入 GPT-6.1 Sol 的 Rust/Go 共享模型模板、客户端可见列表、模型名称保留和推理参数支持。模型模板取自上游 v1.3.64，仅导入新模型条目，保留现有模型和定制内容。应用版本 1.3.59 是本地定制补丁版本，不代表已升级到上游 v1.3.64。

## 1.3.60 GPT-6 模型补全

“API 服务”本地网关、Rust/Go 共享模型模板、模型目录和请求路由加入 `gpt-6-sol` 与 `gpt-6-luna`。GPT-6.1 Sol、GPT-6 Sol 支持 ultra 推理档位，GPT-6 Luna 支持到 max；三者分别配置了上下文窗口和默认价格估算。Windows 中文安装包为 `release-nmoon/NmoonAPI_1.3.60_zh-CN_x64-setup.exe`。实际调用仍取决于账号和 API Key 权限。

## 1.3.61 Windows 交付（2026-10-08）

按本次要求只继续 Windows x64。保留旧包及 Linux/macOS 1.3.58 产物。

- 安装器、快捷方式及窗口显示“小月神api”，安装向导固定简体中文。
- 中转站页面新增“刷新模型与额度”，查询变更后会忽略旧请求返回。供应商配置页已有模型目录手动输入及按 Key 获取模型的功能。
- 关闭手动升级后的原项目更新日志弹窗；启动、定时、手动在线更新及远程推广配置仍关闭。
- 对照官方 v1.3.66 的客户端目录，确认 `gpt-6.1-sol`、`gpt-6-sol`、`gpt-6-luna` ID 及推理档位；保留现有 API 服务目录、默认配置、名称映射与请求路由。
- 修复 Go 静态模型能力查询未覆盖上述 ID 的缺口，参考官方 v1.3.66；补充思考档位、上下文及返回对象独立性的回归测试。不改变 OAuth 套餐权限或承诺模型开放。
- 内置 `NMOON-NOTICE.txt`，保留作者署名、原项目地址和 CC BY-NC-SA 4.0 声明；交付附定制源码。

官方最新 Windows 对照包独立保存在 `release-nmoon/official/`，已与官方 SHA256SUMS 核对。本定制版 1.3.61 是原有本地定制源码的补丁版本，不代表完整合并官方 v1.3.66。

公告接口 `GET /api/v1/announcements` 无登录返回 401（Authorization header is required）；`GET /v1/models` 无 Key 返回 401（API_KEY_REQUIRED）。公开站点设置接口返回 200。没有网站登录、没有修改服务端、没有公开认证公告；本次保留空公告。后续可由站长提供只含允许公开内容的独立接口，或另行设计登录后可见的公告接入。

未提供本站测试 Key，实际模型列表、余额和推理调用未实测。此次不安装、不覆盖现有应用；QQ 唤起、完整安装启动以及朋友设备兼容性仍需实际验证。验证记录、SHA256 和安装说明随最终交付目录提供。
