# 发布与版本管理建议

本项目的定位是「学习 / 内部脚手架级别」的 Nuxt3 全栈电商示例，因此发布与版本管理的目标主要是：

- 让使用者能清晰知道当前稳定版本与变更内容；
- 方便在不同环境中部署指定版本；
- 为未来作为团队脚手架升级时留出空间。

下面是一套尽量简单、但足够实用的方案。

## 1. 版本号策略

采用语义化版本号 (Semantic Versioning)：

```text
MAJOR.MINOR.PATCH   例如：0.3.0、1.0.0
```

- **MAJOR**：有破坏性变更时递增，例如：
  - 模块目录/命名大幅调整；
  - 重要 API 路径改变（如 `/api/cart` → `/api/carts`）；
  - 环境变量或配置方式有明显不兼容调整。
- **MINOR**：向后兼容的新功能：
  - 新增业务模块（如优惠券、活动模块）；
  - 新增 Demo 或架构文档。
- **PATCH**：向后兼容的 Bugfix / 小改动：
  - 修复页面或 API 逻辑错误；
  - 文档修正、UI 微调等。

当前仓库可从 `0.3.0` 或类似版本开始，表示仍处于较快演进阶段。

## 2. 分支与标签

推荐最简分支模型：

- `main`：主分支，始终保持可构建、可部署。
- `feature/*`：特性分支，例如：
  - `feature/cart-discount`
  - `feature/docs-en-release-guide`

发布版本使用 Git 标签记录，例如：

```bash
git tag v0.3.0
git push origin v0.3.0
```

在 GitHub 上为该标签创建 Release 页面，并附上 CHANGELOG 片段。

## 3. 推荐发布流程

以 `v0.3.0` 为例：

1. 在特性分支完成开发与自测：
   - `npm run lint`
   - `npm run test:unit`
   - 如有必要，运行 Playwright E2E。
2. 创建 PR 合入 `main`，等待 CI 全部通过。
3. 在 `main` 上更新版本号：

   ```bash
   npm version minor   # 或 patch / major
   git push origin main
   git push origin --tags
   ```

4. 在 `CHANGELOG.md` 中：
   - 将当前周期的变更从 `[Unreleased]` 移动到 `[0.3.0]`；
   - 简要按 Added/Changed/Fixed/Docs 分类说明。
5. 在 GitHub Release 页面补充：
   - 简短版本描述；
   - 若有 Breaking Changes，单独写一小节说明。

CI 可以根据 `v*` 标签触发部署脚本（例如构建 Docker 镜像、部署到 Demo 环境等）。

## 4. Mongo / 环境变量的兼容性

由于项目使用 MongoDB 和 Redis，建议在版本变更时注意：

### 4.1 MongoDB 模型

- 尽量 **新增字段** 而非直接改名或删除字段；
- 若必须重构字段结构：
  - 先在代码中同时兼容新旧字段；
  - 提供一次性迁移脚本（如 `scripts/migrate-v0.2-to-v0.3.ts`）；
  - 在 changelog 中标明需要运行迁移脚本。

### 4.2 环境变量

- 新增变量：在 `.env.*.example` 中补充并在 README 说明；
- 废弃变量：至少跨一个 MINOR 版本保留兼容逻辑，并在 changelog 中标记 Deprecated；
- 不在代码或日志中打印完整连接串、密码等敏感信息。

## 5. 与文档的关系

- README 只展示当前主版本状态，不做多版本文档；
- 详细架构说明位于 `docs/architecture/*.md` / `*.en.md`；
- 若未来出现“大版本重构”，推荐在相关架构文档顶部注明：

```md
适用版本：>= v1.0.0
```

或记录在 CHANGELOG 中，为读者提供版本上下文。

## 6. 后续可以考虑的自动化

在目前「主分支 + 标签 + 手写 CHANGELOG」的基础上，将来可以逐步引入：

- [release‑please](https://github.com/googleapis/release-please)  
  基于 commit 自动生成版本与 changelog 的 GitHub Action。
- [changesets](https://github.com/changesets/changesets)  
  在 PR 中提交 changeset 文件，合入后自动 bump 版本和更新 changelog。

但对当前仓库而言，先按本页流程做“轻量手工发布”就已经足够清晰可控。

