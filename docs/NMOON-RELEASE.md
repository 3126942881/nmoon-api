# 小月神api 发布说明

仓库：https://github.com/3126942881/nmoon-api

## 日常更新

1. 修改功能并验证；不要修改已发布标签。
2. 在仓库根目录运行 `npm version patch --no-git-tag-version`，然后运行 `npm run sync-version`。也可以使用明确的新版本号。
3. 更新 `docs/releases/v版本号.md` 中的发行说明，提交全部源码和版本文件并推送 `main`。
4. 打开 GitHub **Actions → 发布小月神api → Run workflow**，选择 `main` 并运行。也可推送与 package.json 一致的 `v版本号` 标签。
5. 工作流完成检查、Windows 编译、签名、生成校验文件和更新清单，然后创建并发布 Release。
6. 在同一版本源码上运行 **Actions → 发布小月神api Mac → Run workflow**。两种架构全部构建和验证通过后，流程把 Mac 文件加入现有 Release，并合并更新清单，保留 Windows 更新条目。

一个版本的已发布安装包不能覆盖；需要修改安装包时应提高版本号。Mac 流程可以为已有 Windows 版本补充此前未发布的 Mac 安装包。上传中断时优先重跑失败的发布任务，复用已经验证的构建附件；已有同名文件必须与待上传文件完全一致，否则流程会拒绝覆盖。

## 更新签名

GitHub Actions 使用仓库 Secrets 中的 `TAURI_SIGNING_PRIVATE_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。私钥不存入仓库，也不附在 Release 中。公钥位于 `src-tauri/tauri.conf.json`。

本机私钥备份在原工作目录的 `.build-tools/nmoon-signing/`，应自行保存离线备份。丢失私钥后无法继续为已经安装的客户端签发更新。不要随意更换公钥。

更新地址：`https://github.com/3126942881/nmoon-api/releases/latest/download/latest.json`。

当前工作流覆盖 Windows x64 NSIS、Mac Apple 芯片和 Mac Intel。Mac 的更新文件为 `.app.tar.gz` 及其 `.sig`，普通安装使用 `.dmg`。Mac 发布流程完成后，该版本的 Mac 更新才可用。

旧定制版关闭了在线更新，需要用户先手动安装一次新版：Windows 使用 1.3.80 或更高版本，Mac 使用 1.3.81 或更高版本。已有本地更新偏好不会被强制覆盖。

Mac 包使用 ad-hoc 签名，未配置 Apple Developer ID 或苹果公证。最低系统版本为 macOS 12.0。安装及验证范围见 [Mac 说明](NMOON-MACOS.md)。`MACOS-BUILD.json` 记录实际构建提交；为已有版本补充 Mac 打包流程时，该提交可能晚于版本标签，版本标签保持不变。

## 构建与验证

本地开发需 Node.js、Rust、CMake，以及 Windows Visual Studio C++ 构建工具。GitHub 工作流负责准备云端环境。

```sh
npm ci
npm run typecheck
npm test
npm run test:release
```

构建签名安装包前，将私钥路径与密码通过 `TAURI_SIGNING_PRIVATE_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 环境变量提供，再运行 `npm run tauri -- build --ci --bundles nsis`。不要把密钥写进脚本或提交。

源代码保留上游署名与许可；`docs/upstream-workflows/` 仅保存上游工作流供参考，不会执行上游发布或同步任务。
