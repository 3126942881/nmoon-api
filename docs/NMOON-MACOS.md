# 小月神api：Mac 安装说明

本安装包采用当前定制版源码，包含 `ai.lmgai.cn` 地址及 1.3.81 的额度查询修复。

## 选择安装包

- Apple 芯片（M 系列）：下载名称含 `macos-arm64.dmg` 的文件。
- Intel 芯片：下载名称含 `macos-x64.dmg` 的文件。
- 可在苹果菜单的“关于本机”查看芯片类型。最低系统版本为 macOS 12。

打开 DMG，将“小月神api”拖入“应用程序”，然后从“应用程序”启动。升级前先退出旧版。`.app.tar.gz` 和 `.sig` 用于软件更新，日常安装请选择 `.dmg`。

## 签名说明

此 Mac 版本使用 ad-hoc 应用签名，并提供本项目的更新签名和 SHA-256 校验。**尚未配置 Apple Developer ID 签名和苹果公证**，首次启动可能受到 Gatekeeper 拦截。

仅在确认安装包来自本项目并信任其来源时，按系统“隐私与安全性”中针对该应用的提示确认允许打开。不要关闭整个系统的安全保护。若系统明确报告恶意软件或文件损坏，请先停止安装并反馈具体提示。

[Apple 关于打开未知开发者应用的说明](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unknown-developer-mh40616/mac)

构建流程验证 DMG 完整性、只读挂载、应用架构、版本、最低系统要求、ad-hoc 签名，以及更新归档签名。这些检查不等同于在你的 Mac 上完成完整的安装、登录和 API 调用测试。

## 更新与发布

Mac 安装后的更新检查使用本仓库，并只匹配本机架构。旧的 1.3.58 Mac 定制版没有启用在线更新，需要手动安装新版。

维护者发布新版本时，先运行“发布小月神api”生成 Windows 版本，再运行“发布小月神api Mac”补充同版本 Mac 包。Mac 工作流会验证并合并更新清单，保留 Windows 平台数据；Mac 更新在该工作流完成后可用。

发布页同时提供 `SHA256SUMS-macos.txt` 和 `MACOS-BUILD.json`，后者记录实际构建源码提交。Mac 包可能是在已有 Windows 版本发布后补充，因此请以该记录中的提交为 Mac 构建来源。

网站：[ai.lmgai.cn](https://ai.lmgai.cn)；源码及发布：[3126942881/nmoon-api](https://github.com/3126942881/nmoon-api)。
