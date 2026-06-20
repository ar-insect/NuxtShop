---
# 场景：Git 提交注释生成规则
scene: git_message
alwaysApply: true
description: 为 NuxtShop 生成规范 Git 提交信息，严格使用 type(scope): subject，并优先匹配仓库真实模块 scope
---
# NuxtShop Git Commit Message Rule

你在为 `NuxtShop` 生成 Git 提交信息时，必须遵循以下规则。

## 1. 强制格式

统一格式：

```text
type(scope): short english subject
```

强制要求：

1. `type` 必须使用下方允许的 12 种类型之一，且必须小写。
2. `scope` 强烈建议填写，优先使用本文件提供的项目模块 scope。
3. `subject` 必须是英文短句，首字母小写，不超过 72 个字符。
4. `subject` 使用动词开头，描述本次改动本身，如 `add`、`fix`、`refactor`、`remove`、`update`。
5. `subject` 不要以句号结尾，不要夹带 issue 编号、作者名、无意义前缀。
6. 禁止使用中文描述、禁止写成 `update code`、`fix bug`、`misc changes` 这类空泛语句。

## 2. 允许的 type

仅允许以下 12 种，禁止自定义：

- `feat`: 新增功能或新增页面/接口/能力
- `fix`: 修复缺陷、异常、回归问题
- `docs`: 文档、注释、说明文字修改
- `style`: 纯格式调整，不改变运行逻辑
- `refactor`: 重构实现，不新增功能也不修复既有 bug
- `perf`: 性能优化、缓存优化、查询优化
- `revert`: 回滚某次提交
- `test`: 新增或修改测试
- `chore`: 构建脚本、依赖、工程化、辅助工具调整
- `ci`: CI/CD 配置、工作流、发布流水线修改
- `types`: TypeScript 类型、声明文件变更
- `wip`: 开发中的临时提交，仅限本地分支使用，禁止合入 `main`

## 3. scope 选择规则

优先使用最贴近改动位置和业务语义的 scope。若一次提交跨多个目录，选择“主影响模块”，不要堆砌多个 scope。

推荐 scope 列表：

- 业务模块：`product` `cart` `order` `user` `admin`
- 认证与账号：`auth` `session` `profile` `address` `security`
- 商业能力：`wishlist` `review` `history` `coupon` `ads` `theme`
- 前端基础：`ui` `layout` `home` `i18n` `content` `router`
- 服务端与接口：`api` `server` `middleware` `plugin`
- 数据与基础设施：`mongodb` `redis` `db` `cache`
- 工程与框架：`nuxt` `nitro` `config` `build` `deps` `scripts` `docker` `ci`
- 质量保障：`test` `unit` `e2e` `bdd`
- 通用层：`types` `utils` `docs` `release`

如果改动范围非常集中，可按以下映射优先选择：

- `modules/product/**`、商品列表/详情/分类相关 -> `product`
- `modules/cart/**`、购物车/结算相关 -> `cart`
- `modules/order/**`、订单创建/详情/预览相关 -> `order`
- `modules/user/**`、个人中心相关 -> `user`
- `modules/admin/**`、后台管理页与后台模块相关 -> `admin`
- `server/api/auth/**`、`components/auth/**`、`composables/useAuth.ts`、`plugins/auth.ts` -> `auth`
- `server/api/user/**`、用户资料/地址/安全设置相关 -> `user`、`address`、`security`
- `server/api/products*`、`server/utils/product.ts` -> `product`
- `server/utils/session.ts` -> `session`
- `server/utils/mongodb.ts`、Mongo 初始化与脚本 -> `mongodb` 或 `db`
- `server/utils/redis.ts`、缓存策略相关 -> `redis` 或 `cache`
- `components/ui/**` -> `ui`
- `layouts/**`、`components/layout/**` -> `layout`
- `locales/**`、国际化文案 -> `i18n`
- `docs/**`、`README.md`、`README_EN.md`、`CHANGELOG.md` -> `docs`
- `tests/unit/**` -> `unit`
- `tests/e2e/**` -> `e2e` 或 `bdd`
- `.github/workflows/**` -> `ci`
- `Dockerfile`、`docker-compose*.yml`、`ecosystem.config.js` -> `docker`
- `nuxt.config.ts`、`app/`、Nuxt/Nitro 配置 -> `nuxt` 或 `nitro`
- `types/**`、`*.d.ts` -> `types`
- `utils/**`、`server/utils/**` 通用能力 -> `utils` 或更具体的模块 scope

## 4. type 选择建议

- 新增页面、接口、功能开关、业务能力 -> `feat`
- 修复接口错误、状态同步异常、边界 case -> `fix`
- 提升查询速度、减少重复请求、优化缓存命中 -> `perf`
- 只重组代码结构、抽 composable、拆工具函数 -> `refactor`
- 只补类型、修正泛型、补充声明文件 -> `types`
- 只改测试、补回归用例、补 BDD 场景 -> `test`
- 只改文档、README、注释 -> `docs`
- 只改 lint、依赖、脚本、构建配置 -> `chore`
- 只改 GitHub Actions、部署流水线 -> `ci`
- 回滚已有提交 -> `revert`
- 本地暂存未完成工作 -> `wip`

## 5. 推荐提交示例

适合本项目的示例：

- `feat(product): add category filter for product list`
- `fix(cart): prevent duplicate items during checkout`
- `fix(auth): handle expired session on profile request`
- `feat(admin): add coupon management page`
- `perf(nitro): cache product detail response`
- `refactor(user): extract profile preferences composable`
- `types(api): align order response types with server schema`
- `test(e2e): cover wishlist add and remove flow`
- `docs(auth): document cookie based login flow`
- `chore(deps): upgrade nuxt to latest stable version`
- `ci(release): run deploy workflow on version tags`
- `style(ui): normalize button spacing in base components`

## 6. 禁止示例

以下写法不合规：

- `feat: 新增购物车功能`
- `fix: fix bug`
- `update code`
- `chore(nuxt): Update`
- `feat(cart): add something for checkout and fix many issues`
- `feature(cart): add checkout page`

对应原因：

- 缺少合法 `scope`
- `subject` 使用中文
- `type` 不在允许列表
- 描述空泛或首字母大写
- 描述过长或混合多个不相关改动

## 7. 生成 commit message 时的行为要求

当用户让你生成提交信息时，按以下优先级决策：

1. 先识别主要改动目录和业务目标。
2. 选择最合适的 `type`。
3. 从本文件推荐列表中选择最贴切的 `scope`。
4. 输出单行 commit message，不附加解释，除非用户要求提供多个候选。
5. 若改动明显包含多个独立主题，提醒用户拆分提交，而不是生成含糊的大杂烩描述。

## 8. 默认偏好

- 默认优先填写 `scope`，不要省略。
- 默认使用项目真实模块名作为 `scope`，避免使用过于泛化的 `misc`、`other`、`stuff`。
- 若改动同时涉及前后端，但都围绕同一业务域，优先选业务域 scope，如 `product`、`cart`、`auth`。
- 若改动主要是框架配置、渲染策略、插件接入，优先选 `nuxt`、`nitro`、`plugin`、`config`。
- 若无法确定具体业务域，再退回 `api`、`server`、`utils` 这类通用 scope。
