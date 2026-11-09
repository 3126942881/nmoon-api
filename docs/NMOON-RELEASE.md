# 小月神api 发布说明

仓库：https://github.com/3126942881/nmoon-api

## 日常更新

1. 修改功能并验证；不要修改已发布标签。
2. 在仓库根目录运行 `npm version patch --no-git-tag-version`，然后运行 `npm run sync-version`。也可以使用明确的新版本号。
3. 更新 `docs/releases/v版本号.md` 中的发行说明，提交全部源码和版本文件并推送 `main`。
4. 打开 GitHub **Actions → 发布小月神api → Run workflow**，选择 `main` 并运行。也可推送与 package.json 一致的 `v版本号` 标签。
5. 工作流完成检查、Windows 编译、签名、生成校验文件和更新清单，然后创建并发布 Release。

一个版本只能发布一次。流程失败时，修复后可以重新运行；已公开的版本不能覆盖，应提高版本号再发布。

## 更新签名

GitHub Actions 使用仓库 Secrets 中的 `TAURI_SIGNING_PRIVATE_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。私钥不存入仓库，也不附在 Release 中。公钥位于 `src-tauri/tauri.conf.json`。

本机私钥备份在原工作目录的 `.build-tools/nmoon-signing/`，应自行保存离线备份。丢失私钥后无法继续为已经安装的客户端签发更新。不要随意更换公钥。

更新地址：`https://github.com/3126942881/nmoon-api/releases/latest/download/latest.json`。

当前自动打包及签名更新仅覆盖 Windows x64 NSIS。旧定制版关闭了在线更新，需要用户先手动安装一次 1.3.80 或更高版本。已有本地更新偏好不会被强制覆盖。

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
