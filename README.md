# 小月神api · Nmoon API

由 [3126942881](https://github.com/3126942881) 维护和发布的 AI 开发工具账号管理桌面软件，基于 [Cockpit Tools](https://github.com/jlcodes99/cockpit-tools) 定制。

[下载 Windows 安装包](https://github.com/3126942881/nmoon-api/releases/latest) · [版本记录](https://github.com/3126942881/nmoon-api/releases) · [反馈问题](https://github.com/3126942881/nmoon-api/issues)

## 功能

- 多平台账号管理、账号切换和额度查看。
- 应用多实例管理、本地 API 服务、模型目录及客户端配置。
- 小月神api 供应商预设、模型配置和中文界面。
- 从本仓库获取经过签名验证的 Windows 更新，由本项目维护者决定何时发布。

当前提供 Windows x64 安装包。本项目没有配置自动合并上游更新。

本发行版不包含上游内置的 Google OAuth 参数。Antigravity 的 Google 授权和令牌刷新需在启动程序前自行配置 `NMOON_GOOGLE_CLIENT_ID` 和 `NMOON_GOOGLE_CLIENT_SECRET`；缺少配置时会显示提示。使用者需自行取得适用于该服务的授权客户端参数。

## 安装与更新

在 Releases 下载 `NmoonAPI_版本号_windows-x64-setup.exe` 并运行。安装包为中文安装向导。

**1.3.68 及更早的定制版关闭了在线更新，需要先手动安装 1.3.80 或更高版本。** 此后可在软件设置中检查本仓库的新版本。已有用户是否自动检查更新仍遵循本地设置；默认不自动安装。

`SHA256SUMS.txt` 提供安装包校验值。更新签名用于验证更新来源，不等同于 Windows 代码签名证书。

## 开发与发布

技术栈：React、TypeScript、Tauri 2、Rust。

```sh
npm ci
npm run tauri:dev
```

本仓库的源码版本从定制版 1.3.68 开始整理，基于上游 v1.3.80，并保留本地修复。

发布新版本：修改 `package.json` 和锁文件中的版本号，执行 `npm run sync-version`，更新发行说明并提交。随后在 GitHub 的 **Actions → 发布小月神api → Run workflow** 运行发布流程；也支持推送匹配版本的 `v*` 标签。

详细步骤见 [发布说明](docs/NMOON-RELEASE.md)。

## 来源与许可

原项目：[jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools)，原作者：jlcodes99 / jlcodes。本仓库为独立维护的定制发行版。

原项目及本仓库的定制修改遵循 **CC BY-NC-SA 4.0（署名、非商业性使用、相同方式共享）**。商业使用需取得相关权利人的授权。第三方依赖保留其各自许可证。详见 [许可说明](LICENSE) 和 [定制声明](docs/NMOON-NOTICE.txt)。

网站：https://ai.lmgai.cn；客服 QQ：37579735；QQ群：1108278250。
