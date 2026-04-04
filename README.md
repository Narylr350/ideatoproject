# idea-to-project-structure

一个面向 AI 协作场景的轻量化技能项目，用于把“一个模糊点子”快速收敛成可执行的项目结构，而不是直接生成冗长 PRD。

它吸收了 `product-requirements` 的需求提问方式，以及 `LoopNova` 的上下文分层思路，但不会绑定固定技术栈，也不会强制套用某个仓库模板。核心目标是两件事：

- 从点子快速产出合理的项目结构
- 生成对后续 AI 对话友好的仓库文档分层，降低重复理解项目的 token 成本

## 项目定位

这个项目目前包含一个核心 skill：`idea-to-project-structure`。

它适合这些场景：

- 用户只有一个产品想法，希望快速得到项目结构建议
- 用户希望技术栈和系统形态根据需求动态选择
- 用户希望生成 AI 友好的 `AGENTS.md -> AI_CONTEXT.md -> docs/*` 启动链
- 用户希望把旧项目 retrofit 成更容易被 AI 接手的仓库结构

它不适合这些场景：

- 需要完整长 PRD 的正式产品需求输出
- 只是给现有项目加一个小功能
- 已经有固定仓库结构，不需要结构设计或 AI 工作流分层

## 当前能力

### 1. 新项目结构生成

支持从点子出发，经过轻量提问后，生成适合的项目骨架。

支持的基础形态包括：

- `single-app`
- `frontend-backend`
- `monorepo-web-api-admin`
- `mobile-api-admin`
- `ai-service-app`

### 2. 完整文档模式

如果用户不只要目录结构，也希望把核心文档一次性落到仓库中，可以进入 `full-docs` 模式。

该模式会根据需求动态填充：

- `docs/context/project-overview.md`
- `docs/context/architecture.md`
- `docs/context/tech-stack.md`
- `docs/context/development-roadmap.md`（按需）
- `docs/product/idea.md`
- `docs/engineering/api.md`（按需）

### 3. 旧项目 Retrofit

支持对已有仓库叠加一层 AI 友好的 bootstrap/docs 结构，而不默认搬动源码目录。

当前支持：

- `overlay-only`
- `overlay-and-restructure` 的前置映射与准备

retrofit 时会优先生成：

- `AGENTS.md`
- `CLAUDE.md`
- `AI_CONTEXT.md`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- `docs/testing/`

同时会处理已有 `AGENTS.md` / `CLAUDE.md` 的保留策略：

- `skip`
- `append`
- `overwrite`

## 工作流概览

整体流程已经收敛为下面这条主线：

1. 判断模式：`structure-only` / `full-docs` / `retrofit-existing-project`
2. 确认复杂任务执行方式：`superpowers` 或 `repo-native`
3. 做最小必要的需求澄清
4. 先给出项目结构建议，而不是直接落盘
5. 用户确认后，用脚本生成仓库结构和上下文文档

### 关于 superpowers

这个项目不会默认强推 `using-superpowers`。

- 如果用户选择 `superpowers`
  复杂编码任务可以使用 `using-superpowers`，但输出必须映射回当前仓库的 canonical 路径，不能创建通用的 `docs/superpowers/**`

- 如果用户选择 `repo-native`
  项目管理能力会内化到仓库里，主要依赖：
  - `docs/tasks/<domain>/`
  - `docs/testing/`
  - `docs/context/*`
  - 可选 `development-roadmap.md`

这样即使不依赖外部 skill，也能让项目在后续 AI 会话中持续可管理。

## 目录结构

当前仓库结构如下：

```text
ideatoproject/
└─ idea-to-project-structure/
   ├─ SKILL.md
   ├─ agents/
   │  └─ openai.yaml
   ├─ assets/
   │  └─ templates/
   │     ├─ docs/
   │     └─ shapes/
   └─ scripts/
      └─ init-project-structure.mjs
```

各部分职责：

- `SKILL.md`
  skill 的主说明与工作流定义
- `scripts/init-project-structure.mjs`
  负责创建新项目结构或对旧项目执行 retrofit
- `assets/templates/docs/`
  文档模板集合
- `assets/templates/shapes/manifest.json`
  结构形态定义
- `agents/openai.yaml`
  agent 接入配置

## 使用方式

### 1. 作为 skill 使用

当环境中可直接加载 skill 时，使用 `idea-to-project-structure` 即可进入这套流程。

### 2. 直接调用脚本

新建项目示例：

```bash
node idea-to-project-structure/scripts/init-project-structure.mjs \
  --mode new \
  --root "D:\\Projects" \
  --name "Campus Skill Swap" \
  --shape "monorepo-web-api-admin" \
  --frontend "vue" \
  --backend "spring-boot" \
  --package-manager "pnpm" \
  --execution-workflow "repo-native" \
  --with-admin "true" \
  --with-roadmap "true" \
  --domains "auth,listing,order,admin"
```

旧项目 retrofit 示例：

```bash
node idea-to-project-structure/scripts/init-project-structure.mjs \
  --mode retrofit \
  --project-root "D:\\Projects\\legacy-app" \
  --execution-workflow "repo-native" \
  --instruction-file-mode "skip"
```

## 设计原则

- 不生成重型 PRD，除非用户明确需要
- 项目结构按需求动态选择，不绑定固定语言或框架
- AI 启动链必须明确，避免每次新对话重新扫描整个仓库
- 仓库本地结构优先于通用 workflow 默认结构
- 对复杂任务的管理方式必须可配置：`superpowers` 或 `repo-native`
- 老项目改造默认保守，不默认重构源码目录

## 后续方向

当前版本已经完成以下闭环：

- 点子 -> 项目结构
- 点子 -> 项目结构 + 核心 docs
- 旧项目 -> AI 友好 bootstrap/docs 层

后续更值得继续验证的方向是：

- 用真实项目跑 `retrofit` 验证字段是否足够
- 继续打磨 `overlay-and-restructure` 的受控重构流程
- 根据真实使用情况微调提问深度和默认形态推荐

## 许可证

当前仓库尚未声明许可证。如需开源发布，建议补充 `LICENSE` 文件。
